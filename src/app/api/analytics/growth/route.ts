import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET /api/analytics/growth
// Returns monthly won-deal counts for the last 12 months (pre-aggregated, no raw records)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    // Get all won leads in the last 12 months
    const wonLeads = await prisma.lead.findMany({
      where: {
        agentId: session.user.id,
        status: "Won",
        updatedAt: { gte: twelveMonthsAgo },
      },
      select: { updatedAt: true },
    });

    // Aggregate by month
    const monthlyCounts: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyCounts[key] = 0;
    }

    for (const lead of wonLeads) {
      const key = `${lead.updatedAt.getFullYear()}-${String(lead.updatedAt.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyCounts) {
        monthlyCounts[key]++;
      }
    }

    const growth = Object.entries(monthlyCounts).map(([month, count]) => ({
      month,
      deals: count,
    }));

    return NextResponse.json({ growth });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "GET /api/analytics/growth error");
    return NextResponse.json({ error: { message: "Failed to fetch growth data." } }, { status: 500 });
  }
}
