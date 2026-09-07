import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicApiLimiter, getClientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/intake-links/:id/validate
// Public, rate-limited. Returns only { valid: boolean }.
// Never reveals WHY validation failed (expired vs. used vs. non-existent all look the same).
export async function GET(request: Request, { params }: RouteContext) {
  const ip = getClientIp(request);
  const { success } = await publicApiLimiter.limit(`validate:${ip}`);
  if (!success) {
    return NextResponse.json({ valid: false }, { status: 429 });
  }

  const { id } = await params;

  try {
    const link = await prisma.intakeLink.findUnique({
      where: { id },
      select: { id: true, expiresAt: true, usedAt: true },
    });

    const valid =
      link !== null &&
      link.usedAt === null &&
      link.expiresAt > new Date();

    return NextResponse.json({ valid });
  } catch (err) {
    logger.error({ err, linkId: id }, "GET /api/intake-links/:id/validate error");
    // On error, return valid: false — fail safe
    return NextResponse.json({ valid: false });
  }
}
