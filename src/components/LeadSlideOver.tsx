'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/Badge'

type LeadStatus = 'New' | 'Contacted' | 'Viewing' | 'Negotiating' | 'Won' | 'Lost'

interface Lead {
  id: string
  name: string
  phone?: string | null
  groupType: string
  men: number
  women: number
  hasChildren: boolean
  childrenAges?: string | null
  hasPets: boolean
  petDetails?: string | null
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

interface LeadSlideOverProps {
  lead: Lead
  onClose: () => void
  onUpdate: (lead: Lead) => void
  onDelete: (id: string) => void
}

export function LeadSlideOver({ lead, onClose, onUpdate, onDelete }: LeadSlideOverProps) {
  const [status, setStatus] = useState<LeadStatus>(lead.status as LeadStatus)
  const [notes, setNotes] = useState(lead.notes || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Reset state when lead changes
  useEffect(() => {
    setStatus(lead.status as LeadStatus)
    setNotes(lead.notes || '')
    setError(null)
    setConfirmDelete(false)
  }, [lead.id])

  // Trap focus & ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate({ ...lead, ...data.lead })
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      onDelete(lead.id)
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to delete')
      setDeleting(false)
    }
  }

  const pax = lead.men + lead.women

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Lead details: ${lead.name}`}
        className="fixed inset-y-0 right-0 w-full max-w-md bg-base-surface border-l border-base-border z-50 flex flex-col animate-slide-in-right overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-base font-semibold text-text-primary">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={lead.status as LeadStatus} />
              {lead.intakeLinkId && (
                <span className="text-[10px] text-violet bg-violet/10 border border-violet/20 rounded px-1.5 py-0.5">
                  From form
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-5">
            {/* Contact info */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">Contact</h3>
              <div className="flex flex-col gap-1 text-sm">
                {lead.phone && <p className="text-text-primary">{lead.phone}</p>}
              </div>
            </section>

            {/* Group details */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">Group</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-text-muted">Type</span><span className="text-text-primary">{lead.groupType}</span>
                {pax > 0 && <><span className="text-text-muted">Adults</span><span className="text-text-primary">{pax} ({lead.men}M / {lead.women}F)</span></>}
                {lead.hasChildren && <><span className="text-text-muted">Children</span><span className="text-text-primary">{lead.childrenAges || 'Yes'}</span></>}
                {lead.hasPets && <><span className="text-text-muted">Pets</span><span className="text-text-primary">{lead.petDetails || 'Yes'}</span></>}
                {lead.nationality && <><span className="text-text-muted">Nationality</span><span className="text-text-primary">{lead.nationality}</span></>}
                {lead.visaType && <><span className="text-text-muted">Visa</span><span className="text-text-primary">{lead.visaType}</span></>}
              </div>
            </section>

            {/* Requirements */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">Requirements</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-text-muted">Type</span><span className="text-text-primary">{lead.propertyType}</span>
                {lead.budget && <><span className="text-text-muted">Budget</span><span className="text-text-primary text-purple">€{lead.budget}</span></>}
                {lead.preferredArea && <><span className="text-text-muted">Area</span><span className="text-text-primary">{lead.preferredArea}</span></>}
                {lead.moveInDate && <><span className="text-text-muted">Move-in</span><span className="text-text-primary">{lead.moveInDate}</span></>}
              </div>
            </section>

            {/* Status update */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">Update Status</h3>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                options={[
                  { value: 'New', label: 'New' },
                  { value: 'Contacted', label: 'Contacted' },
                  { value: 'Viewing', label: 'Viewing' },
                  { value: 'Negotiating', label: 'Negotiating' },
                  { value: 'Won', label: 'Won ✓' },
                  { value: 'Lost', label: 'Lost ✗' },
                ]}
              />
            </section>

            {/* Notes */}
            <section>
              <label
                htmlFor="lead-notes"
                className="text-xs font-semibold uppercase tracking-widest text-text-muted block mb-2"
              >
                Notes
              </label>
              <textarea
                id="lead-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full px-3 py-2 rounded text-sm text-text-primary bg-base-bg border border-base-border placeholder:text-text-muted resize-none focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple/30 transition-colors"
                placeholder="Add notes…"
              />
              <p className="text-[10px] text-text-muted text-right mt-0.5">{notes.length}/2000</p>
            </section>

            {error && <p className="text-sm text-status-lost">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 flex items-center justify-between gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
          >
            {confirmDelete ? 'Confirm Delete (GDPR)' : 'Delete Lead'}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </div>
    </>
  )
}
