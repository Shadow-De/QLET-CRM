import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/growth — aggregated deals-won stats only, no raw data
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Last 6 months of Won leads, grouped by month
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  // Raw aggregation using Prisma's $queryRaw (parameterized — safe from injection)
  const rows = await prisma.$queryRaw<
    { month: Date; count: bigint }[]
  >`
    SELECT
      date_trunc('month', "statusAt") AS month,
      COUNT(*)::bigint AS count
    FROM "Lead"
    WHERE
      status = 'Won'
      AND "deletedAt" IS NULL
      AND "statusAt" >= ${sixMonthsAgo}
    GROUP BY date_trunc('month', "statusAt")
    ORDER BY month ASC
  `

  const monthlyData = rows.map((r) => ({
    month: r.month.toISOString().slice(0, 7), // YYYY-MM
    count: Number(r.count),
  }))

  // Pad missing months with 0
  const result: { month: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = d.toISOString().slice(0, 7)
    const found = monthlyData.find((m) => m.month === key)
    result.push({ month: key, count: found?.count ?? 0 })
  }

  // Current month stats
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [thisMonthWon, lastMonthWon, thisMonthLeads] = await Promise.all([
    prisma.lead.count({
      where: { status: 'Won', deletedAt: null, statusAt: { gte: startOfMonth } },
    }),
    prisma.lead.count({
      where: { status: 'Won', deletedAt: null, statusAt: { gte: lastMonth, lte: endLastMonth } },
    }),
    prisma.lead.count({
      where: { deletedAt: null, createdAt: { gte: startOfMonth } },
    }),
  ])

  const momGrowth = lastMonthWon === 0
    ? thisMonthWon > 0 ? 100 : 0
    : Math.round(((thisMonthWon - lastMonthWon) / lastMonthWon) * 100)

  return NextResponse.json({
    monthlyWon: result,
    thisMonthWon,
    lastMonthWon,
    momGrowthPercent: momGrowth,
    thisMonthLeads,
  })
}
