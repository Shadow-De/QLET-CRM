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
        className="fixed inset-y-0 right-0 w-full max-w-md bg-surface-container-low border-l border-outline-variant/30 z-50 flex flex-col animate-slide-in-right overflow-hidden shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 bg-gradient-to-b from-surface to-transparent">
          <div>
            <h2 className="text-lg font-display font-medium text-on-surface tracking-tight">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={lead.status as LeadStatus} />
              {lead.intakeLinkId && (
                <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 uppercase tracking-wider">
                  From form
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-variant transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
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
              <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Group</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-outline">Type</span><span className="text-on-surface">{lead.groupType}</span>
                {pax > 0 && <><span className="text-outline">Adults</span><span className="text-on-surface">{pax} ({lead.men}M / {lead.women}F)</span></>}
                {lead.hasChildren && <><span className="text-outline">Children</span><span className="text-on-surface">{lead.childrenAges || 'Yes'}</span></>}
                {lead.hasPets && <><span className="text-outline">Pets</span><span className="text-on-surface">{lead.petDetails || 'Yes'}</span></>}
                {lead.nationality && <><span className="text-outline">Nationality</span><span className="text-on-surface">{lead.nationality}</span></>}
                {lead.visaType && <><span className="text-outline">Visa</span><span className="text-on-surface">{lead.visaType}</span></>}
              </div>
            </section>

            {/* Requirements */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Requirements</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-outline">Type</span><span className="text-on-surface">{lead.propertyType}</span>
                {lead.budget && <><span className="text-outline">Budget</span><span className="text-primary font-medium">€{lead.budget}</span></>}
                {lead.preferredArea && <><span className="text-outline">Area</span><span className="text-on-surface">{lead.preferredArea}</span></>}
                {lead.moveInDate && <><span className="text-outline">Move-in</span><span className="text-on-surface">{lead.moveInDate}</span></>}
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
                className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant block mb-2"
              >
                Notes
              </label>
              <textarea
                id="lead-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full px-3 py-2 rounded text-sm text-on-surface bg-surface-container border border-outline-variant placeholder:text-outline resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                placeholder="Add notes…"
              />
              <p className="text-[10px] text-text-muted text-right mt-0.5">{notes.length}/2000</p>
            </section>

            {error && <p className="text-sm text-status-lost">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/30 flex items-center justify-between gap-2 bg-surface-container-low">
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
