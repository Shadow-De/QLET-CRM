import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET /api/analytics/demand
// Returns aggregated demand breakdowns by area, propertyType, and nationality
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  try {
    const [byArea, byPropertyType, byNationality] = await Promise.all([
      prisma.lead.groupBy({
        by: ["area"],
        where: { agentId: session.user.id, area: { not: null } },
        _count: { area: true },
        orderBy: { _count: { area: "desc" } },
        take: 10,
      }),
      prisma.lead.groupBy({
        by: ["propertyType"],
        where: { agentId: session.user.id, propertyType: { not: null } },
        _count: { propertyType: true },
        orderBy: { _count: { propertyType: "desc" } },
      }),
      prisma.lead.groupBy({
        by: ["nationality"],
        where: { agentId: session.user.id, nationality: { not: null } },
        _count: { nationality: true },
        orderBy: { _count: { nationality: "desc" } },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      byArea: byArea.map((r: { area: string | null; _count: { area: number } }) => ({ area: r.area, count: r._count.area })),
      byPropertyType: byPropertyType.map((r: { propertyType: string | null; _count: { propertyType: number } }) => ({
        type: r.propertyType,
        count: r._count.propertyType,
      })),
      byNationality: byNationality.map((r: { nationality: string | null; _count: { nationality: number } }) => ({
        nationality: r.nationality,
        count: r._count.nationality,
      })),
    });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "GET /api/analytics/demand error");
    return NextResponse.json({ error: { message: "Failed to fetch demand data." } }, { status: 500 });
  }
}
