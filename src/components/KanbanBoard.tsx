'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/ui/Badge'
import { LeadSlideOver } from '@/components/LeadSlideOver'

type LeadStatus = 'New' | 'Contacted' | 'Viewing' | 'Negotiating' | 'Won' | 'Lost'

interface Lead {
  id: string
  name: string
  phone?: string | null
  groupType: string
  men: number
  women: number
  hasChildren: boolean
  hasPets: boolean
  nationality?: string | null
  visaType?: string | null
  propertyType: string
  budget?: string | null
  preferredArea?: string | null
  moveInDate?: string | null
  notes?: string | null
  status: string
  statusAt: Date | string
  createdAt: Date | string
  intakeLinkId?: string | null
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Viewing', 'Negotiating', 'Won', 'Lost']

function daysAgo(date: Date | string): string {
  const d = new Date(date)
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return '1d ago'
  return `${diff}d ago`
}

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const pax = lead.men + lead.women
  return (
    <div
      onClick={onClick}
      className="lead-card rounded-xl p-4 cursor-pointer"
      role="button"
      aria-label={`Lead: ${lead.name}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-on-surface text-lg">{lead.name}</h4>
        <span className="material-symbols-outlined text-outline text-sm">more_horiz</span>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">apartment</span>
          <span>{lead.propertyType}{lead.preferredArea ? `, ${lead.preferredArea}` : ''}</span>
        </div>
        {(lead.budget || pax > 0 || lead.hasChildren || lead.hasPets) && (
          <div className="flex items-center gap-2 text-sm text-tertiary">
            <span className="material-symbols-outlined text-[16px]">euro</span>
            <span className="font-medium">
              {lead.budget ? `€${lead.budget}/mo` : 'TBD'}
              {pax > 0 ? ` • ${pax} pax` : ''}
              {lead.hasChildren ? ' • 👶' : ''}
              {lead.hasPets ? ' • 🐾' : ''}
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-wider text-outline px-2 py-1 bg-surface-container-high rounded border border-outline-variant/30">
          {daysAgo(lead.createdAt)}
        </span>
        {lead.intakeLinkId && (
          <span className="text-[10px] text-primary uppercase tracking-wider text-outline px-2 py-1 bg-primary/10 rounded border border-primary/30">
            Form
          </span>
        )}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  initialLeads: Record<LeadStatus, Lead[]>
}

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Record<LeadStatus, Lead[]>>(initialLeads)
  const [selected, setSelected] = useState<Lead | null>(null)

  function handleLeadUpdate(updatedLead: Lead) {
    setLeads((prev) => {
      const newState = { ...prev }
      for (const status of STATUSES) {
        newState[status] = newState[status].filter((l) => l.id !== updatedLead.id)
      }
      const newStatus = updatedLead.status as LeadStatus
      newState[newStatus] = [updatedLead, ...newState[newStatus]]
      return newState
    })
    setSelected(updatedLead)
  }

  function handleLeadDelete(leadId: string) {
    setLeads((prev) => {
      const newState = { ...prev }
      for (const status of STATUSES) {
        newState[status] = newState[status].filter((l) => l.id !== leadId)
      }
      return newState
    })
    setSelected(null)
  }

  const columnConfig: Record<LeadStatus, { color: string, hex: string }> = {
    New: { color: 'primary', hex: '#A855F7' },
    Contacted: { color: 'secondary', hex: '#6D5EF5' },
    Viewing: { color: 'tertiary', hex: '#4ADE80' }, // using green for tertiary here to match screenshot mapping
    Negotiating: { color: 'error', hex: '#F87171' },
    Won: { color: 'green-500', hex: '#10B981' },
    Lost: { color: 'outline', hex: '#9898B0' },
  }

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4 h-full" style={{ minHeight: 'calc(100vh - 160px)' }}>
        {STATUSES.map((status) => {
          const config = columnConfig[status]
          return (
            <div
              key={status}
              className="w-80 flex flex-col h-full shrink-0"
              role="region"
              aria-label={`${status} column`}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-display font-semibold text-on-surface tracking-wide flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: config.hex }}></span>
                  {status}
                </h3>
                <span className={`bg-surface-container-high px-2 py-0.5 rounded text-xs font-bold text-${config.color}`} style={{ color: config.hex }}>
                  {leads[status].length}
                </span>
              </div>
              <div className="kanban-column flex-1 overflow-y-auto space-y-3 pb-4">
                {leads[status].map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onClick={() => setSelected(lead)}
                  />
                ))}
                {leads[status].length === 0 && (
                  <div className="h-24 border border-dashed border-outline-variant/30 rounded-xl flex items-center justify-center text-outline text-sm font-body bg-surface-container-low/50">
                    Drop card here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <LeadSlideOver
          lead={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleLeadUpdate}
          onDelete={handleLeadDelete}
        />
      )}
    </>
  )
}
