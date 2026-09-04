import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createLinkSchema = z.object({
  note: z.string().max(200).optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
})

// GET /api/intake-links — list all links with usage stats
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const links = await prisma.intakeLink.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      note: true,
      expiresAt: true,
      usageCount: true,
      createdAt: true,
    },
  })

  const appUrl = process.env.APP_URL || 'http://localhost:3000'

  return NextResponse.json({
    links: links.map((l) => ({
      ...l,
      url: `${appUrl}/apply/${l.id}`,
      expired: l.expiresAt < new Date(),
    })),
  })
}

// POST /api/intake-links — create a new link
export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const agentId = (session.user as { id: string }).id
  if (!agentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createLinkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + parsed.data.expiresInDays)

  const link = await prisma.intakeLink.create({
    data: {
      note: parsed.data.note || null,
      expiresAt,
      agentId,
    },
    select: { id: true, note: true, expiresAt: true, createdAt: true },
  })

  const appUrl = process.env.APP_URL || 'http://localhost:3000'

  return NextResponse.json({
    link: {
      ...link,
      url: `${appUrl}/apply/${link.id}`,
    },
  })
}
