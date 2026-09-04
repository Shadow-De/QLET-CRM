import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/ui/Card'
import { GrowthChart } from '@/components/GrowthChart'
import { prisma } from '@/lib/db'

async function getGrowthData() {
  const session = await auth()
  if (!session) redirect('/login')

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const rows = await prisma.$queryRaw<{ month: Date; count: bigint }[]>`
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
    month: r.month.toISOString().slice(0, 7),
    count: Number(r.count),
  }))

  const result: { month: string; count: number; label: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = d.toISOString().slice(0, 7)
    const label = d.toLocaleString('en-GB', { month: 'short' })
    const found = monthlyData.find((m) => m.month === key)
    result.push({ month: key, label, count: found?.count ?? 0 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [thisMonthWon, lastMonthWon, thisMonthLeads, totalActive] = await Promise.all([
    prisma.lead.count({ where: { status: 'Won', deletedAt: null, statusAt: { gte: startOfMonth } } }),
    prisma.lead.count({ where: { status: 'Won', deletedAt: null, statusAt: { gte: lastMonth, lte: endLastMonth } } }),
    prisma.lead.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
    prisma.lead.count({ where: { deletedAt: null, status: { notIn: ['Won', 'Lost'] } } }),
  ])

  const momGrowth =
    lastMonthWon === 0
      ? thisMonthWon > 0 ? 100 : 0
      : Math.round(((thisMonthWon - lastMonthWon) / lastMonthWon) * 100)

  return { monthlyWon: result, thisMonthWon, lastMonthWon, momGrowth, thisMonthLeads, totalActive }
}

export default async function DashboardPage() {
  const data = await getGrowthData()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary" id="dashboard-heading">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Your lettings overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4" id="stat-cards">
        <StatCard
          id="stat-won-month"
          label="Won This Month"
          value={data.thisMonthWon}
          delta={data.lastMonthWon > 0 ? data.momGrowth : null}
        />
        <StatCard
          label="New Leads This Month"
          value={data.thisMonthLeads}
        />
        <StatCard
          label="Active Pipeline"
          value={data.totalActive}
        />
        <StatCard
          label="Last Month Won"
          value={data.lastMonthWon}
        />
      </div>

      {/* 6-month chart */}
      <div className="surface p-5" id="growth-chart">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">
          Deals Won — 6-Month Trend
        </h2>
        <GrowthChart data={data.monthlyWon} />
      </div>
    </div>
  )
}
