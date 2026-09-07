import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
    }

    const agentId = session.user.id;

    const [
      totalLeads,
      wonLeads,
      lostLeads,
      newLeads,
      recentLeads,
      recentProperties,
      leadsByStatus
    ] = await Promise.all([
      prisma.lead.count({ where: { agentId } }),
      prisma.lead.count({ where: { agentId, status: 'Won' } }),
      prisma.lead.count({ where: { agentId, status: 'Lost' } }),
      prisma.lead.count({ where: { agentId, status: 'New' } }),
      prisma.lead.findMany({
        where: { agentId },
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.findMany({
        where: { agentId },
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { agentId },
        _count: {
          id: true
        }
      })
    ]);

    const pipelineCounts = {
      New: 0,
      Contacted: 0,
      Viewing: 0,
      Negotiating: 0,
      Won: 0,
      Lost: 0,
    };

    leadsByStatus.forEach(group => {
      if (group.status in pipelineCounts) {
        pipelineCounts[group.status as keyof typeof pipelineCounts] = group._count.id;
      }
    });

    const wonLeadsList = await prisma.lead.findMany({
      where: { agentId, status: 'Won' },
      select: { updatedAt: true, budget: true }
    });

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const currentMonth = new Date().getMonth();
    
    // Get last 6 months including current
    const monthlySales = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date();
      date.setMonth(currentMonth - (5 - i));
      return {
        name: months[date.getMonth()],
        value: 0,
        isCurrent: i === 5,
        monthIndex: date.getMonth(),
        year: date.getFullYear()
      };
    });

    wonLeadsList.forEach(lead => {
      const leadDate = new Date(lead.updatedAt);
      const match = monthlySales.find(m => m.monthIndex === leadDate.getMonth() && m.year === leadDate.getFullYear());
      if (match && lead.budget) {
        // Extract numeric value from budget string (e.g. '1650', '?1,650')
        const numericBudget = parseFloat(lead.budget.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericBudget)) {
          match.value += numericBudget;
        }
      }
    });

    // Clean up internal keys
    const chartData = monthlySales.map(({ name, value, isCurrent }) => ({ name, value, isCurrent }));

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        wonLeads,
        lostLeads,
        newLeads,
        recentLeads,
        recentProperties,
        pipelineCounts,
        chartData
      }
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }
    });

  } catch (error: any) {
    console.error("Failed to fetch dashboard data:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
