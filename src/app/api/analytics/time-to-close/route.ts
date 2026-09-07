import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET /api/analytics/time-to-close
// Returns average days from lead creation to Won status
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  try {
    const wonLeads = await prisma.lead.findMany({
      where: { agentId: session.user.id, status: "Won" },
      select: { createdAt: true, updatedAt: true },
    });

    if (wonLeads.length === 0) {
      return NextResponse.json({ averageDays: null, totalWon: 0 });
    }

    const totalDays = wonLeads.reduce((sum: number, lead: { createdAt: Date; updatedAt: Date }) => {
      const diffMs = lead.updatedAt.getTime() - lead.createdAt.getTime();
      return sum + diffMs / (1000 * 60 * 60 * 24);
    }, 0);

    const averageDays = Math.round((totalDays / wonLeads.length) * 10) / 10;

    return NextResponse.json({ averageDays, totalWon: wonLeads.length });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "GET /api/analytics/time-to-close error");
    return NextResponse.json(
      { error: { message: "Failed to fetch time-to-close data." } },
      { status: 500 }
    );
  }
}
