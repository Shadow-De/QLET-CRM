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
    <div className="min-h-screen bg-[#0B0B12]" style={{
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(168,85,247,0.06) 31px, rgba(168,85,247,0.06) 32px),
        repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(168,85,247,0.06) 31px, rgba(168,85,247,0.06) 32px)
      `
    }}>
      <IntakeForm token={token} />
    </div>
  )
}

function LinkInactive() {
  return (
    <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#14141F] border border-[rgba(168,85,247,0.15)] mb-6">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgba(168,85,247,0.5)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-[#F1F1F8] mb-3">Link No Longer Active</h1>
        <p className="text-[#9898B0] text-sm leading-relaxed">
          This link is no longer active. Please contact your agent to receive a new one.
        </p>
      </div>
    </div>
  )
}
