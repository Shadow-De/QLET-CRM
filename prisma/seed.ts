import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.AGENT_SEED_EMAIL || 'agent@qlet.mt'
  const password = process.env.AGENT_SEED_PASSWORD || 'ChangeMe123!'

  if (password === 'ChangeMe123!') {
    console.warn('⚠️  Using default seed password — change AGENT_SEED_PASSWORD before production deployment!')
  }

  const passwordHash = await bcrypt.hash(password, 14)

  const agent = await prisma.agent.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      hasSeenTour: false,
      role: 'AGENT',
    },
  })

  console.log(`✅ Agent account ready: ${agent.email} (id: ${agent.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
