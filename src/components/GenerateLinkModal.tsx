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
        <div className="flex flex-col gap-5">
          <p className="text-sm text-outline font-body leading-relaxed">
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
          {error && <p className="text-sm font-medium text-error">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleGenerate} loading={loading}>Generate Link</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-on-surface-variant font-body">Unique secure link generated.</p>
            <div className="inline-flex items-center px-3 py-1.5 bg-surface-container rounded text-xs text-primary font-mono border border-outline-variant/30 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              ACTIVE VALIDITY: {expiresInDays} DAYS
            </div>
          </div>
          
          <div className="relative flex items-center w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="text-outline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              readOnly
              value={generatedUrl}
              className="block w-full pl-10 pr-24 py-3 bg-surface-container-highest border border-outline-variant text-on-surface font-mono text-sm rounded focus:ring-1 focus:ring-primary/50 outline-none select-all cursor-text transition-all"
            />
            <button 
              onClick={handleCopy}
              className={`absolute inset-y-1 right-1 px-3 text-xs font-label uppercase tracking-widest rounded transition-all active:scale-95 flex items-center space-x-1 ${copied ? 'bg-green-600 text-white' : 'bg-primary text-on-primary hover:bg-primary-container'}`}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          
          <div className="flex gap-3 justify-end pt-2 border-t border-outline-variant/30 mt-2">
            <Button variant="ghost" onClick={handleClose}>Close</Button>
            <Button onClick={() => setGeneratedUrl(null)}>Generate Another</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
