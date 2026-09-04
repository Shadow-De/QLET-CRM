import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sanitizeObject } from '@/lib/sanitize'
import { verifyTurnstile } from '@/lib/turnstile'
import { writeAudit } from '@/lib/audit'
import { getClientIp, ipRatelimit, tokenRatelimit } from '@/lib/ratelimit'

const publicLeadSchema = z.object({
  // Token identifying the intake link
  token: z.string().uuid(),

  // Honeypot — must be empty
  _hp: z.string().max(0, 'Bot detected'),

  // Turnstile challenge response
  turnstileToken: z.string().min(1).max(2048),

  // Lead fields
  name: z.string().min(1).max(200),
  phone: z.string().max(30).optional().default(''),
  groupType: z.enum(['Single', 'Couple', 'Group']),
  men: z.coerce.number().int().min(0).max(20).default(0),
  women: z.coerce.number().int().min(0).max(20).default(0),
  hasChildren: z.coerce.boolean().default(false),
  childrenAges: z.string().max(100).optional().default(''),
  hasPets: z.coerce.boolean().default(false),
  petDetails: z.string().max(200).optional().default(''),
  nationality: z.string().max(100).optional().default(''),
  visaType: z.string().max(100).optional().default(''),
  propertyType: z.enum(['Apartment', 'House', 'Penthouse', 'Villa', 'Studio', 'Maisonette', 'Other']),
  budget: z.string().max(50).optional().default(''),
  preferredArea: z.string().max(200).optional().default(''),
  moveInDate: z.string().max(50).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
})

// CORS — only our own domain
function corsHeaders(origin: string | null) {
  const allowedOrigin = process.env.APP_URL || 'http://localhost:3000'
  const isAllowed = origin === allowedOrigin || !origin
  return {
    'Access-Control-Allow-Origin': isAllowed ? allowedOrigin : 'null',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)

  // IP rate limit
  if (ipRatelimit) {
    const { success } = await ipRatelimit.limit(ip)
    if (!success) {
      await writeAudit('RATE_LIMIT_HIT', ip, 'ip-limit:public-form')
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      )
    }
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  }

  const parsed = publicLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400, headers })
  }

  const data = parsed.data

  // Honeypot check
  if (data._hp !== '') {
    await writeAudit('HONEYPOT_TRIGGERED', ip)
    // Silently succeed to confuse bots
    return NextResponse.json({ success: true }, { headers })
  }

  // Turnstile verification
  const turnstileOk = await verifyTurnstile(data.turnstileToken, ip)
  if (!turnstileOk) {
    await writeAudit('TURNSTILE_FAILED', ip)
    return NextResponse.json(
      { error: 'Security check failed. Please reload and try again.' },
      { status: 403, headers }
    )
  }

  // Token validation — generic error for all failure modes
  const genericTokenError = NextResponse.json(
    { error: 'This link is no longer active. Please contact your agent for a new one.' },
    { status: 410, headers }
  )

  const intakeLink = await prisma.intakeLink.findUnique({
    where: { id: data.token },
    select: { id: true, expiresAt: true },
  })

  if (!intakeLink) {
    await writeAudit('INVALID_TOKEN', ip, 'not-found')
    return genericTokenError
  }

  if (intakeLink.expiresAt < new Date()) {
    await writeAudit('INVALID_TOKEN', ip, 'expired')
    return genericTokenError
  }

  // Token rate limit
  if (tokenRatelimit) {
    const { success } = await tokenRatelimit.limit(data.token)
    if (!success) {
      await writeAudit('RATE_LIMIT_HIT', ip, `token-limit:${data.token.slice(0, 8)}`)
      return NextResponse.json(
        { error: 'Too many submissions for this link. Please try again later.' },
        { status: 429, headers }
      )
    }
  }

  // Sanitize all string fields
  const sanitized = sanitizeObject({
    name: data.name,
    phone: data.phone || '',
    groupType: data.groupType,
    nationality: data.nationality || '',
    visaType: data.visaType || '',
    propertyType: data.propertyType,
    budget: data.budget || '',
    preferredArea: data.preferredArea || '',
    moveInDate: data.moveInDate || '',
    notes: data.notes || '',
    childrenAges: data.childrenAges || '',
    petDetails: data.petDetails || '',
  })

  // Create the lead
  await prisma.$transaction([
    prisma.lead.create({
      data: {
        intakeLinkId: intakeLink.id,
        name: sanitized.name,
        phone: sanitized.phone || null,
        groupType: sanitized.groupType,
        men: data.men,
        women: data.women,
        hasChildren: data.hasChildren,
        childrenAges: sanitized.childrenAges || null,
        hasPets: data.hasPets,
        petDetails: sanitized.petDetails || null,
        nationality: sanitized.nationality || null,
        visaType: sanitized.visaType || null,
        propertyType: sanitized.propertyType,
        budget: sanitized.budget || null,
        preferredArea: sanitized.preferredArea || null,
        moveInDate: sanitized.moveInDate || null,
        notes: sanitized.notes || null,
        status: 'New',
      },
    }),
    prisma.intakeLink.update({
      where: { id: intakeLink.id },
      data: { usageCount: { increment: 1 } },
    }),
  ])

  await writeAudit('LEAD_CREATED_PUBLIC', ip, `token:${data.token.slice(0, 8)}`)

  return NextResponse.json({ success: true }, { headers })
}
