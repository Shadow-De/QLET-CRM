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
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface tracking-tight" id="dashboard-heading">Overview</h1>
          <p className="text-sm text-on-surface-variant mt-1">Real-time metrics and system status.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-surface-container/50 border border-outline-variant/30 px-3 py-1.5 rounded flex items-center gap-2 text-xs text-on-surface-variant font-mono">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            System Online
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="stat-cards">
        <StatCard
          id="stat-won-month"
          label="Deals Won"
          value={data.thisMonthWon}
          delta={data.lastMonthWon > 0 ? data.momGrowth : null}
        />
        <StatCard
          label="Open Leads"
          value={data.totalActive}
          delta={-5} // Mock data to match design
        />
        <StatCard
          label="New Leads"
          value={data.thisMonthLeads}
        />
        <StatCard
          label="Conversion"
          value="18.5"
          suffix="%"
          delta={1}
        />
      </div>

      {/* Middle Section: Chart and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 6-month chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-lg flex flex-col" id="growth-chart">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-medium text-on-surface">Deals Velocity (6 Months)</h3>
            <button className="text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </button>
          </div>
          <div className="flex-grow">
            <GrowthChart data={data.monthlyWon} />
          </div>
        </div>
        
        {/* Context / Location Card */}
        <div className="glass-card rounded-lg overflow-hidden flex flex-col relative h-[320px] lg:h-auto">
          <div className="p-6 pb-0 absolute top-0 left-0 w-full z-10 flex justify-between items-start bg-gradient-to-b from-surface to-transparent pb-8">
            <h3 className="text-lg font-display font-medium text-on-surface drop-shadow-md">Active Zones</h3>
            <span className="bg-surface-container/80 backdrop-blur text-xs px-2 py-1 rounded border border-outline-variant">Live Map</span>
          </div>
          <div className="h-full w-full bg-surface-container-low relative">
            <div className="bg-cover bg-center w-full h-full absolute inset-0 opacity-70 mix-blend-screen" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDgb_T6qdWwhbTxSLjgkizLalRH8KzV9VT8gdASZ8RSL-tD1ayQxuafHy57wTFepjD-7KMCK6R7t3BJQ8-vn6eY92O6kT6-JYJfY4KDmp97tKl6lkyagDlWFfqPliBVSZvqH4YtyymU3tfA0HSVsNW7jhFIN8n_M1mUoMv-_IvX_LnixlENGcjVyXYS40R2173GFTsYmIn3rrhXgvrH-4bkFz_Eky5LV95XcwHexjI45V49qF5F-KDX60N9ap8LVnEm0RZFyJ5rq91F')" }}></div>
            <div className="absolute top-[40%] left-[60%] w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(183,109,255,1)] animate-pulse"></div>
            <div className="absolute top-[55%] left-[45%] w-2 h-2 bg-secondary rounded-full shadow-[0_0_10px_rgba(197,192,255,1)]"></div>
            <div className="absolute top-[30%] left-[70%] w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,1)]"></div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity */}
      <div className="glass-card p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
          <h3 className="text-lg font-display font-medium text-on-surface">Terminal Activity Log</h3>
          <a href="#" className="text-sm text-primary hover:text-primary-container transition-colors font-medium">View Full Log</a>
        </div>
        <div className="flex flex-col gap-1">
          {/* Activity Items */}
          {[
            { icon: 'contract', title: 'New Lease Signed', desc: 'Client: Marcus Vella • 12 Months • €2,400/mo', time: '10:42 AM', status: 'Confirmed', color: 'green-500' },
            { icon: 'home', title: 'Property Listed', desc: 'Assigned to: Network A • Ready for viewings', time: '09:15 AM', status: 'Indexed', color: 'primary' },
            { icon: 'contact_mail', title: 'Lead Contacted', desc: 'Automated follow-up sent via Channel 4', time: 'Yesterday', status: 'Pending', color: 'secondary' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 px-4 hover:bg-surface-variant/30 rounded transition-colors group cursor-pointer">
              <div className={`w-10 h-10 rounded bg-${item.color}/10 border border-${item.color}/20 flex items-center justify-center text-${item.color} group-hover:bg-${item.color}/20 group-hover:border-${item.color}/40 transition-all`}>
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium text-on-surface">{item.title}</p>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-outline font-mono">{item.time}</span>
                <div className={`text-[10px] text-${item.color} uppercase tracking-widest mt-1`}>{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
