import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authLimiter, getClientIp } from "@/lib/ratelimit";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { logger } from "@/lib/logger";

// Generic message regardless of whether email exists — prevents user enumeration
const GENERIC_RESPONSE = {
  message: "If that email exists in our system, a reset link has been sent.",
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = await authLimiter.limit(ip);
  if (!success) {
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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    // Return generic response — don't hint at what was wrong
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const { email } = parsed.data;

  try {
    const agent = await prisma.agent.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!agent) {
      // Always return generic response — no oracle
      return NextResponse.json(GENERIC_RESPONSE);
    }

    // Expire any existing unused reset tokens for this agent
    await prisma.passwordReset.updateMany({
      where: { agentId: agent.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Create new reset token (expires in 1 hour)
    const reset = await prisma.passwordReset.create({
      data: {
        agentId: agent.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // Send email
    const emailError = await sendPasswordResetEmail({
      to: agent.email,
      resetToken: reset.token,
      name: agent.name,
    });

    if (emailError) {
      logger.error({ agentId: agent.id }, "Failed to send password reset email");
    }
  } catch (err) {
    logger.error({ err }, "forgot-password route error");
    // Still return generic response — never expose internal errors
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
