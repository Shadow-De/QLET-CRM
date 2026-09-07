import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createIntakeLinkSchema } from "@/lib/validations/intakeLink";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body." } }, { status: 400 });
  }

  const parsed = createIntakeLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed.", code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  try {
    // Resolve expiry: use provided value, or fall back to agent's settings default
    let expiryDays = parsed.data.expiryDays;
    if (!expiryDays) {
      const settings = await prisma.agentSettings.findUnique({
        where: { agentId: session.user.id },
        select: { defaultLinkExpiryDays: true },
      });
      expiryDays = settings?.defaultLinkExpiryDays ?? 7;
    }

    const expiresAt = new Date(Date.now() + (expiryDays ?? 7) * 24 * 60 * 60 * 1000);

    const link = await prisma.intakeLink.create({
      data: {
        agentId: session.user.id,
        expiresAt,
        ...(parsed.data.leadId && { leads: { connect: { id: parsed.data.leadId } } }),
      },
      select: { id: true, token: true, expiresAt: true, createdAt: true },
    });

    const shareableUrl = `${process.env.NEXT_PUBLIC_APP_URL}/intake/${link.id}`;

    return NextResponse.json(
      {
        link: {
          ...link,
          url: shareableUrl,
          expiryDays,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "POST /api/intake-links error");
    return NextResponse.json(
      { error: { message: "Failed to generate intake link." } },
      { status: 500 }
    );
  }
}
