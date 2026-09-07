import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicApiLimiter, tokenLimiter, getClientIp } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { publicLeadSchema } from "@/lib/validations/lead";
import { sendNewLeadNotification } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";

// This is the only public write endpoint in the system.
// It is locked down with: rate limiting (IP + token), Turnstile, Zod strict, honeypot.
export async function POST(request: Request) {
  const ip = getClientIp(request);

  // 1. IP rate limit
  const ipCheck = await publicApiLimiter.limit(ip);
  if (!ipCheck.success) {
    return NextResponse.json(
      { error: { message: "Too many requests. Please try again later." } },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body." } }, { status: 400 });
  }

  // 2. Zod validation (.strict() rejects extra fields)
  const parsed = publicLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed.", code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  const { intakeLinkId, turnstileToken, website, ...leadData } = parsed.data;

  // 3. Honeypot check — bots fill this field, humans don't
  // The schema validates website is literal "" so any truthy value indicates a bot
  if (website !== undefined && website !== "") {
    // Return 200 to fool bots into thinking submission succeeded
    return NextResponse.json({ message: "Form submitted successfully." });
  }

  // 4. Cloudflare Turnstile server-side verification
  const turnstileValid = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileValid) {
    return NextResponse.json(
      { error: { message: "Bot verification failed. Please try again." } },
      { status: 403 }
    );
  }

  // 5. Per-token rate limit (prevents one link being used many times quickly)
  const tokenCheck = await tokenLimiter.limit(intakeLinkId);
  if (!tokenCheck.success) {
    return NextResponse.json(
      { error: { message: "This link has received too many requests. Please contact your agent." } },
      { status: 429 }
    );
  }

  try {
    // 6. Validate intake link — must exist, be unexpired, and be unused
    const intakeLink = await prisma.intakeLink.findUnique({
      where: { id: intakeLinkId },
      include: {
        agent: {
          select: {
            id: true,
            email: true,
            name: true,
            settings: { select: { emailOnNewLead: true } },
          },
        },
      },
    });

    if (!intakeLink || intakeLink.usedAt !== null || intakeLink.expiresAt < new Date()) {
      // Generic response — don't reveal whether expired vs. never existed vs. used
      return NextResponse.json(
        { error: { message: "This link is no longer valid." } },
        { status: 400 }
      );
    }

    // 7. Atomically create lead + mark link as used
    const lead = await prisma.$transaction(async (tx) => {
      const newLead = await tx.lead.create({
        data: {
          ...leadData,
          agentId: intakeLink.agentId,
          intakeLinkId: intakeLink.id,
          status: "New",
          source: "Direct",
        },
        select: { id: true, name: true, propertyType: true, area: true },
      });

      await tx.intakeLink.update({
        where: { id: intakeLink.id },
        data: { usedAt: new Date() },
      });

      return newLead;
    });

    await writeAuditLog("lead.created_via_intake", intakeLink.agentId, lead.id, {
      via: "intake_link",
    });

    // 8. Fire notification email if agent has it enabled (non-blocking)
    if (intakeLink.agent.settings?.emailOnNewLead) {
      sendNewLeadNotification({
        agentEmail: intakeLink.agent.email,
        agentName: intakeLink.agent.name,
        leadName: lead.name,
        propertyType: lead.propertyType,
        area: lead.area,
      }).catch((err) => logger.error({ err }, "Failed to send new lead notification email"));
    }

    return NextResponse.json({ message: "Application submitted successfully." }, { status: 201 });
  } catch (err) {
    logger.error({ err, intakeLinkId }, "POST /api/leads/public error");
    return NextResponse.json(
      { error: { message: "Submission failed. Please try again." } },
      { status: 500 }
    );
  }
}
