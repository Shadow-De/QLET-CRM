import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { logger } from "@/lib/logger";
import { authLimiter, getClientIp } from "@/lib/ratelimit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = await authLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: { message: "Too many requests. Please try again later." } }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body." } }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Invalid or missing fields.", code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  try {
    const reset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { agent: { select: { id: true } } },
    });

    // Invalid, expired, or already used
    if (!reset || reset.usedAt !== null || reset.expiresAt < new Date()) {
      return NextResponse.json(
        { error: { message: "This reset link is invalid or has expired." } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Atomically: mark token as used + update password hash
    await prisma.$transaction([
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      prisma.agent.update({
        where: { id: reset.agent.id },
        data: { passwordHash },
      }),
    ]);

    return NextResponse.json({ message: "Password updated successfully. You can now log in." });
  } catch (err) {
    logger.error({ err }, "reset-password route error");
    return NextResponse.json(
      { error: { message: "An unexpected error occurred. Please try again." } },
      { status: 500 }
    );
  }
}
