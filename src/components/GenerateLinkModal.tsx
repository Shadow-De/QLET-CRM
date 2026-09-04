'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface GenerateLinkModalProps {
  open: boolean
  onClose: () => void
}

export function GenerateLinkModal({ open, onClose }: GenerateLinkModalProps) {
  const [note, setNote] = useState('')
  const [expiresInDays, setExpiresInDays] = useState('7')
  const [loading, setLoading] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/intake-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note || undefined, expiresInDays: parseInt(expiresInDays) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setGeneratedUrl(data.link.url)
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to generate link')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!generatedUrl) return
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose() {
    setNote('')
    setExpiresInDays('7')
    setGeneratedUrl(null)
    setCopied(false)
    setError(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Generate Client Intake Link" size="md">
      {!generatedUrl ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            Share this link with a prospective tenant. They fill the form — a lead appears on your board instantly, no account needed.
          </p>
          <Input
            label="Label (optional)"
            placeholder="e.g. John Smith — +356 1234 5678"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
          />
          <Select
            label="Link expires in"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
            options={[
              { value: '3', label: '3 days' },
              { value: '7', label: '7 days (recommended)' },
              { value: '14', label: '14 days' },
              { value: '30', label: '30 days' },
            ]}
          />
          {error && <p className="text-sm text-status-lost">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleGenerate} loading={loading}>Generate Link</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-status-won/20 flex items-center justify-center">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#39FF88" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-status-won">Link created</span>
          </div>
          <div className="flex gap-2 items-stretch">
            <input
              readOnly
              value={generatedUrl}
              className="flex-1 px-3 py-2 rounded text-xs bg-base-bg border border-base-border text-text-secondary font-mono truncate"
            />
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-xs text-text-muted">
            Share this URL with your client. They can submit without creating an account.
          </p>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" onClick={handleClose}>Close</Button>
            <Button onClick={() => { setGeneratedUrl(null) }}>Generate Another</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
