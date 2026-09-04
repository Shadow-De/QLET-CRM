import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const agentId = (session.user as { id: string }).id
  if (!agentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.agent.update({
    where: { id: agentId },
    data: { hasSeenTour: true },
  })

  return NextResponse.json({ success: true })
}
