import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// GET /api/leads — list all leads (not soft-deleted)
export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200)

  const where = {
    deletedAt: null,
    ...(status ? { status: status as never } : {}),
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      name: true,
      phone: true,
      groupType: true,
      men: true,
      women: true,
      hasChildren: true,
      hasPets: true,
      nationality: true,
      visaType: true,
      propertyType: true,
      budget: true,
      preferredArea: true,
      moveInDate: true,
      notes: true,
      status: true,
      statusAt: true,
      createdAt: true,
      intakeLinkId: true,
    },
  })

  return NextResponse.json({ leads })
}
