'use client'

import { useState, useRef } from 'react'

const PROPERTY_TYPES = ['Apartment', 'House', 'Penthouse', 'Villa', 'Studio', 'Maisonette', 'Other']
const GROUP_TYPES = ['Single', 'Couple', 'Group']
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

const STEPS = ['About Your Group', 'Your Situation', 'What You\'re Looking For', 'Review & Submit']

type Step = 1 | 2 | 3 | 4

interface FormData {
  name: string
  phone: string
  groupType: string
  men: number
  women: number
  hasChildren: boolean
  childrenAges: string
  hasPets: boolean
  petDetails: string
  nationality: string
  visaType: string
  propertyType: string
  budget: string
  preferredArea: string
  moveInDate: string
  notes: string
  _hp: string // honeypot
}

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <div className={[
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
              i + 1 < step ? 'bg-[#A855F7] text-white' :
              i + 1 === step ? 'bg-[#A855F7]/20 border-2 border-[#A855F7] text-[#A855F7]' :
              'bg-[#14141F] border border-[rgba(168,85,247,0.15)] text-[#5C5C78]',
            ].join(' ')}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
          </div>
        ))}
      </div>
      <div className="w-full bg-[#14141F] h-1 rounded-full">
        <div
          className="bg-[#A855F7] h-1 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
      <p className="text-center text-xs text-[#9898B0] mt-2">{STEPS[step - 1]}</p>
    </div>
  )
}

function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#9898B0]">
        {label}{required && <span className="text-[#A855F7] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#5C5C78]">{hint}</p>}
    </div>
  )
}

const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm text-[#F1F1F8] bg-[#0B0B12] border border-[rgba(168,85,247,0.15)] placeholder:text-[#5C5C78] focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[rgba(168,85,247,0.3)] transition-colors"
const checkboxClass = "w-4 h-4 rounded border-[rgba(168,85,247,0.3)] bg-[#0B0B12] accent-[#A855F7] cursor-pointer"

export function IntakeForm({ token }: { token: string }) {
  const [step, setStep] = useState<Step>(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const turnstileToken = useRef<string>('')

  const [form, setForm] = useState<FormData>({
    name: '', phone: '', groupType: 'Single', men: 1, women: 0,
    hasChildren: false, childrenAges: '', hasPets: false, petDetails: '',
    nationality: '', visaType: '', propertyType: 'Apartment',
    budget: '', preferredArea: '', moveInDate: '', notes: '', _hp: '',
  })

  function set(field: keyof FormData, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Bind Turnstile callback to window
  if (typeof window !== 'undefined') {
    ;(window as unknown as { onTurnstileSuccess?: (t: string) => void }).onTurnstileSuccess = (t: string) => {
      turnstileToken.current = t
      setError(null)
    }
  }

  function canProceed() {
    if (step === 1) return form.name.trim().length > 0
    if (step === 3) return form.propertyType.length > 0
    return true
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      // If Turnstile is configured, get the token
      let tsToken = turnstileToken.current
      if (!tsToken && TURNSTILE_SITE_KEY) {
        // Token will be populated by the Turnstile widget callback
        setError('Please complete the security check.')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/leads/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...form,
          turnstileToken: tsToken || 'dev-skip',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (e: unknown) {
      setError((e as Error).message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(57,255,136,0.1)] border border-[rgba(57,255,136,0.3)] mb-6">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#39FF88" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#F1F1F8] mb-3">Application Received!</h1>
          <p className="text-[#9898B0] text-sm leading-relaxed">
            Thank you — your agent will be in touch shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] mb-4">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F1F1F8]">Rental Application</h1>
          <p className="text-sm text-[#9898B0] mt-1">Malta Lettings</p>
        </div>

        <div className="bg-[#14141F] border border-[rgba(168,85,247,0.15)] rounded-2xl p-6">
          <ProgressBar step={step} />

          {/* Honeypot — hidden from real users */}
          <input
            type="text"
            name="_hp"
            value={form._hp}
            onChange={(e) => set('_hp', e.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
            autoComplete="off"
          />

          {/* Step 1: About Your Group */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Field label="Full Name" required>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  maxLength={200}
                  placeholder="Your full name"
                  autoFocus
                  autoComplete="name"
                />
              </Field>
              <Field label="Phone Number" hint="Optional — helps the agent contact you quickly">
                <input
                  className={inputClass}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  maxLength={30}
                  placeholder="+356 9999 0000"
                  autoComplete="tel"
                />
              </Field>
              <Field label="Group Type" required>
                <div className="flex gap-2">
                  {GROUP_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('groupType', t)}
                      className={[
                        'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all',
                        form.groupType === t
                          ? 'bg-[rgba(168,85,247,0.15)] border-[#A855F7] text-[#A855F7]'
                          : 'bg-[#0B0B12] border-[rgba(168,85,247,0.15)] text-[#9898B0] hover:border-[rgba(168,85,247,0.3)]',
                      ].join(' ')}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Men">
                  <input className={inputClass} type="number" min={0} max={20} value={form.men} onChange={(e) => set('men', parseInt(e.target.value) || 0)} />
                </Field>
                <Field label="Women">
                  <input className={inputClass} type="number" min={0} max={20} value={form.women} onChange={(e) => set('women', parseInt(e.target.value) || 0)} />
                </Field>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className={checkboxClass} checked={form.hasChildren} onChange={(e) => set('hasChildren', e.target.checked)} />
                  <span className="text-sm text-[#9898B0]">Travelling with children</span>
                </label>
                {form.hasChildren && (
                  <input className={inputClass} value={form.childrenAges} onChange={(e) => set('childrenAges', e.target.value)} maxLength={100} placeholder="Ages, e.g. 3, 7" />
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className={checkboxClass} checked={form.hasPets} onChange={(e) => set('hasPets', e.target.checked)} />
                  <span className="text-sm text-[#9898B0]">Have pets</span>
                </label>
                {form.hasPets && (
                  <input className={inputClass} value={form.petDetails} onChange={(e) => set('petDetails', e.target.value)} maxLength={200} placeholder="e.g. 1 small dog" />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Your Situation */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <Field label="Nationality" hint="Optional">
                <input className={inputClass} value={form.nationality} onChange={(e) => set('nationality', e.target.value)} maxLength={100} placeholder="e.g. British, Italian…" autoComplete="off" autoFocus />
              </Field>
              <Field label="Visa / Residency Status" hint="Optional — helps us find eligible properties">
                <input className={inputClass} value={form.visaType} onChange={(e) => set('visaType', e.target.value)} maxLength={100} placeholder="e.g. EU citizen, work permit…" autoComplete="off" />
              </Field>
            </div>
          )}

          {/* Step 3: What You're Looking For */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <Field label="Property Type" required>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('propertyType', t)}
                      className={[
                        'py-2 rounded-lg text-sm font-medium border transition-all',
                        form.propertyType === t
                          ? 'bg-[rgba(168,85,247,0.15)] border-[#A855F7] text-[#A855F7]'
                          : 'bg-[#0B0B12] border-[rgba(168,85,247,0.15)] text-[#9898B0] hover:border-[rgba(168,85,247,0.3)]',
                      ].join(' ')}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Monthly Budget" hint="e.g. €1,200 or €1,000–€1,500">
                <input className={inputClass} value={form.budget} onChange={(e) => set('budget', e.target.value)} maxLength={50} placeholder="€ per month" autoFocus />
              </Field>
              <Field label="Preferred Area">
                <input className={inputClass} value={form.preferredArea} onChange={(e) => set('preferredArea', e.target.value)} maxLength={200} placeholder="e.g. Sliema, St Julian's, Valletta…" />
              </Field>
              <Field label="Ideal Move-in Date">
                <input className={inputClass} type="date" value={form.moveInDate} onChange={(e) => set('moveInDate', e.target.value)} />
              </Field>
              <Field label="Anything else we should know?">
                <textarea
                  className={inputClass}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Any specific requirements, questions…"
                  style={{ resize: 'none' }}
                />
              </Field>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#0B0B12] rounded-xl p-4 flex flex-col gap-3 text-sm">
                <ReviewRow label="Name" value={form.name} />
                {form.phone && <ReviewRow label="Phone" value={form.phone} />}
                <ReviewRow label="Group" value={`${form.groupType} · ${form.men + form.women} adults${form.hasChildren ? ' · with children' : ''}${form.hasPets ? ' · pets' : ''}`} />
                {form.nationality && <ReviewRow label="Nationality" value={form.nationality} />}
                {form.visaType && <ReviewRow label="Visa" value={form.visaType} />}
                <ReviewRow label="Looking for" value={form.propertyType} />
                {form.budget && <ReviewRow label="Budget" value={`€${form.budget}/mo`} />}
                {form.preferredArea && <ReviewRow label="Area" value={form.preferredArea} />}
                {form.moveInDate && <ReviewRow label="Move-in" value={form.moveInDate} />}
                {form.notes && <ReviewRow label="Notes" value={form.notes} />}
              </div>

              {/* Cloudflare Turnstile widget */}
              {TURNSTILE_SITE_KEY && (
                <div
                  className="cf-turnstile"
                  data-sitekey={TURNSTILE_SITE_KEY}
                  data-theme="dark"
                  data-callback="onTurnstileSuccess"
                  data-size="flexible"
                />
              )}

              {error && (
                <div className="px-3 py-2.5 rounded-lg bg-red-900/20 border border-red-500/30 text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[rgba(168,85,247,0.2)] text-[#9898B0] hover:text-[#F1F1F8] hover:border-[rgba(168,85,247,0.4)] transition-all"
              >
                ← Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => canProceed() && setStep((s) => (s + 1) as Step)}
                disabled={!canProceed()}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#A855F7] text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#A855F7] text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting…
                  </>
                ) : 'Submit Application'}
              </button>
            )}
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-[#5C5C78] mt-4 px-4">
          Your information is shared only with your agent and is handled in accordance with GDPR.
        </p>
      </div>

      {/* Load Turnstile script */}
      {TURNSTILE_SITE_KEY && (
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      )}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-[#5C5C78] w-24 shrink-0">{label}</span>
      <span className="text-[#F1F1F8] flex-1">{value}</span>
    </div>
  )
}
