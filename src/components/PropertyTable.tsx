'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'

interface Property {
  id: string
  reference: string
  city: string
  ownerName?: string | null
  ownerMobile?: string | null
  propertyType: string
  price?: string | null
  available: boolean
  availableFrom?: Date | string | null
  notes?: string | null
  createdAt: Date | string
}

const PROPERTY_TYPES = [
  'Apartment', 'House', 'Penthouse', 'Villa', 'Studio', 'Maisonette', 'Other'
]

function AddPropertyForm({ onAdd }: { onAdd: (p: Property) => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    reference: '', city: '', ownerName: '', ownerMobile: '',
    propertyType: 'Apartment', price: '', notes: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ownerName: form.ownerName || undefined,
          ownerMobile: form.ownerMobile || undefined,
          price: form.price || undefined,
          notes: form.notes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add property')
      onAdd(data.property)
      setForm({ reference: '', city: '', ownerName: '', ownerMobile: '', propertyType: 'Apartment', price: '', notes: '' })
      setOpen(false)
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button id="add-property-btn" onClick={() => setOpen(true)}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Property
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Property" size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <Input label="Reference *" value={form.reference} onChange={(e) => set('reference', e.target.value)} required maxLength={50} placeholder="e.g. MLT-001" autoFocus />
          <Input label="City *" value={form.city} onChange={(e) => set('city', e.target.value)} required maxLength={100} placeholder="e.g. Sliema" />
          <Select
            label="Type *"
            value={form.propertyType}
            onChange={(e) => set('propertyType', e.target.value)}
            options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <Input label="Price / Month" value={form.price} onChange={(e) => set('price', e.target.value)} maxLength={50} placeholder="e.g. 1200" />
          <Input label="Owner Name" value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} maxLength={200} placeholder="John Borg" />
          <Input label="Owner Mobile" value={form.ownerMobile} onChange={(e) => set('ownerMobile', e.target.value)} maxLength={30} placeholder="+356 9999 0000" type="tel" />
          <div className="col-span-2">
            <label className="text-sm font-medium text-text-secondary block mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              maxLength={2000}
              rows={3}
              className="w-full px-3 py-2 rounded text-sm text-text-primary bg-base-bg border border-base-border placeholder:text-text-muted resize-none focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple/30"
              placeholder="Any notes about the property…"
            />
          </div>
          {error && <p className="col-span-2 text-sm text-status-lost">{error}</p>}
          <div className="col-span-2 flex gap-2 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Property</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

interface PropertyTableProps {
  initialProperties: Property[]
}

export function PropertyTable({ initialProperties }: PropertyTableProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [sortField, setSortField] = useState<keyof Property>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleAdd(p: Property) {
    setProperties((prev) => [p, ...prev])
  }

  async function toggleAvailability(id: string, current: boolean) {
    const res = await fetch(`/api/properties/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !current }),
    })
    if (res.ok) {
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, available: !current } : p))
      )
    }
  }

  function handleSort(field: keyof Property) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sorted = [...properties].sort((a, b) => {
    const av = a[sortField] ?? ''
    const bv = b[sortField] ?? ''
    const cmp = String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  function SortIcon({ field }: { field: keyof Property }) {
    if (sortField !== field) return <span className="text-text-muted">↕</span>
    return <span className="text-purple">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const th = (field: keyof Property, label: string) => (
    <th
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-muted cursor-pointer hover:text-text-secondary select-none"
    >
      {label} <SortIcon field={field} />
    </th>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddPropertyForm onAdd={handleAdd} />
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5">
              <tr>
                {th('reference', 'Ref')}
                {th('city', 'City')}
                {th('propertyType', 'Type')}
                {th('price', 'Price')}
                {th('ownerName', 'Owner')}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-muted">Available</th>
                {th('ownerMobile', 'Mobile')}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr
                  key={p.id}
                  className={[
                    'border-b border-white/5 hover:bg-white/[0.02] transition-colors',
                    i % 2 === 0 ? '' : 'bg-white/[0.01]',
                  ].join(' ')}
                >
                  <td className="px-4 py-3 font-mono text-xs text-purple">{p.reference}</td>
                  <td className="px-4 py-3 text-text-primary">{p.city}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.propertyType}</td>
                  <td className="px-4 py-3 text-text-primary font-medium">{p.price ? `€${p.price}` : '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.ownerName || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailability(p.id, p.available)}
                      className={[
                        'inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1 transition-all',
                        p.available
                          ? 'bg-status-won/10 text-status-won hover:bg-status-won/20'
                          : 'bg-status-lost/10 text-status-lost hover:bg-status-lost/20',
                      ].join(' ')}
                      aria-label={`Toggle availability for ${p.reference}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.available ? 'bg-status-won' : 'bg-status-lost'}`} />
                      {p.available ? 'Available' : 'Let'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs font-mono">{p.ownerMobile || '—'}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-muted text-sm">
                    No properties yet — add your first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
