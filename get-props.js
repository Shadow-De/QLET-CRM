const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const count = await prisma.property.count();
  const props = await prisma.property.findMany({ select: { id: true, title: true, createdAt: true, address: true, city: true, type: true, monthlyRent: true } });
  console.log('Total properties in DB:', count);
  console.log('Properties:', props);
  await prisma.$disconnect();
}
run();
