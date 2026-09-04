import { prisma } from '@/lib/db'
import { IntakeForm } from './IntakeForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QLET — Rental Application',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ token: string }>
}

async function validateToken(token: string) {
  // Validate UUID format first to avoid unnecessary DB lookup
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token)) return null

  const link = await prisma.intakeLink.findUnique({
    where: { id: token },
    select: { id: true, expiresAt: true },
  })

  if (!link || link.expiresAt < new Date()) return null
  return link
}

export default async function ApplyPage({ params }: PageProps) {
  const { token } = await params
  const link = await validateToken(token)

  if (!link) {
    return <LinkInactive />
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" style={{
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(221,183,255,0.03) 31px, rgba(221,183,255,0.03) 32px),
        repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(221,183,255,0.03) 31px, rgba(221,183,255,0.03) 32px)
      `
    }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="relative z-10">
        <IntakeForm token={token} />
      </div>
    </div>
  )
}

function LinkInactive() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center p-8 glass-card rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-error/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-high border border-error/20 mb-6 shadow-[0_0_15px_rgba(255,180,171,0.1)]">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-error" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-display font-medium text-on-surface mb-3">Link No Longer Active</h1>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            This link is no longer active. Please contact your agent to receive a new one.
          </p>
        </div>
      </div>
    </div>
  )
}
