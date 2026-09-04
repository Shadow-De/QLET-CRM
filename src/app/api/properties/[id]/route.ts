import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updatePropertySchema = z.object({
  city: z.string().min(1).max(100).optional(),
  ownerName: z.string().max(200).optional(),
  ownerMobile: z.string().max(30).optional(),
  propertyType: z.enum(['Apartment', 'House', 'Penthouse', 'Villa', 'Studio', 'Maisonette', 'Other']).optional(),
  price: z.string().max(50).optional(),
  available: z.boolean().optional(),
  availableFrom: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = updatePropertySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await prisma.property.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.property.update({
    where: { id },
    data: {
      ...parsed.data,
      availableFrom: parsed.data.availableFrom ? new Date(parsed.data.availableFrom) : undefined,
    },
    select: {
      id: true, reference: true, city: true, ownerName: true,
      ownerMobile: true, propertyType: true, price: true,
      available: true, availableFrom: true, notes: true, updatedAt: true,
    },
  })

  return NextResponse.json({ property: updated })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.property.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.property.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
