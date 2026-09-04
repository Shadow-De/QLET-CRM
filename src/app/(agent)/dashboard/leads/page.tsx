import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { KanbanBoard } from '@/components/KanbanBoard'

export const dynamic = 'force-dynamic'

type LeadStatus = 'New' | 'Contacted' | 'Viewing' | 'Negotiating' | 'Won' | 'Lost'

export default async function LeadsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      phone: true,
      groupType: true,
      men: true,
      women: true,
      hasChildren: true,
      hasPets: true,
      nationality: true,
      visaType: true,
      propertyType: true,
      budget: true,
      preferredArea: true,
      moveInDate: true,
      notes: true,
      status: true,
      statusAt: true,
      createdAt: true,
      intakeLinkId: true,
    },
  })

  const grouped: Record<LeadStatus, typeof leads> = {
    New: [],
    Contacted: [],
    Viewing: [],
    Negotiating: [],
    Won: [],
    Lost: [],
  }
  for (const lead of leads) {
    grouped[lead.status as LeadStatus].push(lead)
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Leads</h1>
          <p className="text-sm text-text-muted mt-1">{leads.length} leads total</p>
        </div>
      </div>
      <KanbanBoard initialLeads={grouped} />
    </div>
  )
}
