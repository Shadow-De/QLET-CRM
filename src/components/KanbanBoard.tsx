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
    <button
      onClick={onClick}
      className="w-full text-left surface surface-hover p-3 flex flex-col gap-2 animate-slide-up"
      aria-label={`Lead: ${lead.name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-text-primary leading-tight truncate">{lead.name}</p>
        <span className="text-[10px] text-text-muted shrink-0">{daysAgo(lead.createdAt)}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 text-[11px] text-text-muted">
        <span>{lead.groupType}{pax > 0 ? ` · ${pax}` : ''}</span>
        {lead.hasChildren && <span>· 👶</span>}
        {lead.hasPets && <span>· 🐾</span>}
        <span>· {lead.propertyType}</span>
      </div>
      {lead.budget && (
        <p className="text-xs text-purple font-medium">€{lead.budget}</p>
      )}
      {lead.preferredArea && (
        <p className="text-[11px] text-text-muted truncate">📍 {lead.preferredArea}</p>
      )}
      {lead.intakeLinkId && (
        <span className="text-[10px] text-violet bg-violet/10 border border-violet/20 rounded px-1.5 py-0.5 self-start">
          From form
        </span>
      )}
    </button>
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
      // Remove from all columns
      for (const status of STATUSES) {
        newState[status] = newState[status].filter((l) => l.id !== updatedLead.id)
      }
      // Add to new column
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

  const columnColors: Record<LeadStatus, string> = {
    New: 'border-t-purple',
    Contacted: 'border-t-violet',
    Viewing: 'border-t-yellow-500',
    Negotiating: 'border-t-blue-500',
    Won: 'border-t-status-won',
    Lost: 'border-t-status-lost',
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 160px)' }}>
        {STATUSES.map((status) => (
          <div
            key={status}
            className="flex flex-col flex-shrink-0 w-60"
            role="region"
            aria-label={`${status} column`}
          >
            <div className={`surface border-t-2 ${columnColors[status]} px-3 py-2.5 mb-2 flex items-center justify-between`}>
              <StatusBadge status={status} />
              <span className="text-xs text-text-muted font-mono">{leads[status].length}</span>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {leads[status].map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onClick={() => setSelected(lead)}
                />
              ))}
              {leads[status].length === 0 && (
                <div className="border-2 border-dashed border-base-border rounded-lg p-4 text-center text-text-muted text-xs">
                  No leads
                </div>
              )}
            </div>
          </div>
        ))}
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
