import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@qlet.com';
  const password = 'password123';
  const name = 'Admin User';
  const role = 'admin';

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.agent.upsert({
    where: { email },
    update: { passwordHash, name, role },
    create: { email, passwordHash, name, role },
  });

  console.log(`\n✅ Admin account created successfully!`);
  console.log(`Username (Email): ${admin.email}`);
  console.log(`Password: ${password}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
