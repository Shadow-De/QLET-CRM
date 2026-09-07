import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  try {
    await prisma.agentSettings.upsert({
      where: { agentId: session.user.id },
      update: { hasSeenTour: false },
      create: { agentId: session.user.id, hasSeenTour: false },
    });

    return NextResponse.json({ message: "Tour reset. It will show on your next visit." });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "POST /api/settings/replay-tour error");
    return NextResponse.json({ error: { message: "Failed to reset tour." } }, { status: 500 });
  }
}
