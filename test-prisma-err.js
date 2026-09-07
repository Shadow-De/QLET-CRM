const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const agent = await prisma.agent.findFirst();
  try {
    const prop = await prisma.property.create({
      data: {
        title: '2 Bed apartment in birkirkara',
        address: '99647',
        city: 'birkirkara',
        postcode: '',
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        monthlyRent: '1500',
        landlordName: 'sam wil',
        ownerPhone: '1236547889',
        available: true,
        description: '',
        epcRating: null,
        availableFrom: null,
        agentId: agent.id
      }
    });
    console.log('Success:', prop);
  } catch(e) {
    console.log('Error message:', e.message);
  }
  await prisma.$disconnect();
}
run();
