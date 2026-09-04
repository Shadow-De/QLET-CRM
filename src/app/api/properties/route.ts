import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const propertySchema = z.object({
  reference: z.string().min(1).max(50),
  city: z.string().min(1).max(100),
  ownerName: z.string().max(200).optional(),
  ownerMobile: z.string().max(30).optional(),
  propertyType: z.enum(['Apartment', 'House', 'Penthouse', 'Villa', 'Studio', 'Maisonette', 'Other']),
  price: z.string().max(50).optional(),
  available: z.boolean().default(true),
  availableFrom: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional(),
})

// GET /api/properties
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, reference: true, city: true, ownerName: true,
      ownerMobile: true, propertyType: true, price: true,
      available: true, availableFrom: true, notes: true, createdAt: true,
    },
  })

  return NextResponse.json({ properties })
}

// POST /api/properties
export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = propertySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const property = await prisma.property.create({
      data: {
        ...parsed.data,
        availableFrom: parsed.data.availableFrom ? new Date(parsed.data.availableFrom) : null,
      },
      select: {
        id: true, reference: true, city: true, ownerName: true,
        ownerMobile: true, propertyType: true, price: true,
        available: true, availableFrom: true, notes: true, createdAt: true,
      },
    })
    return NextResponse.json({ property }, { status: 201 })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Reference already exists' }, { status: 409 })
    }
    throw e
  }
}
