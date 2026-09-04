import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateLeadSchema = z.object({
  status: z
    .enum(['New', 'Contacted', 'Viewing', 'Negotiating', 'Won', 'Lost'])
    .optional(),
  notes: z.string().max(2000).optional(),
  phone: z.string().max(30).optional(),
  budget: z.string().max(50).optional(),
  preferredArea: z.string().max(200).optional(),
})

// PATCH /api/leads/[id] — update status or notes
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = updateLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await prisma.lead.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, status: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updateData: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.status && parsed.data.status !== existing.status) {
    updateData.statusAt = new Date()
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: updateData,
    select: {
      id: true, name: true, status: true, statusAt: true, notes: true,
      phone: true, budget: true, preferredArea: true, updatedAt: true,
    },
  })

  return NextResponse.json({ lead: updated })
}

// DELETE /api/leads/[id] — soft delete (GDPR erasure)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.lead.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.lead.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
