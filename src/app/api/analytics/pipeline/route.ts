import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const STATUSES = ["New", "Contacted", "Viewing", "Negotiating", "Won", "Lost"] as const;

// GET /api/analytics/pipeline
// Returns counts and percentages per lead status
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  try {
    const counts = await prisma.lead.groupBy({
      by: ["status"],
      where: { agentId: session.user.id },
      _count: { status: true },
    });

    const countMap: Record<string, number> = {};
    for (const c of counts) {
      countMap[c.status] = c._count.status;
    }

    const total = Object.values(countMap).reduce((a, b) => a + b, 0);

    const pipeline = STATUSES.map((status) => ({
      status,
      count: countMap[status] ?? 0,
      percentage: total > 0 ? Math.round(((countMap[status] ?? 0) / total) * 100) : 0,
    }));

    return NextResponse.json({ pipeline, total });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "GET /api/analytics/pipeline error");
    return NextResponse.json({ error: { message: "Failed to fetch pipeline data." } }, { status: 500 });
  }
}
