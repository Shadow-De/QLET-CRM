
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const agent = await prisma.agent.findFirst();
  if (!agent) { console.log('No agent found'); return; }
  
  const payload = {
    title: '1 Bed apartment in London',
    address: 'REF-TEST-' + Math.floor(Math.random()*1000),
    city: 'London',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: '1000',
    available: true,
    availableFrom: null,
    description: '',
    epcRating: null,
    postcode: '',
    landlordName: '',
    ownerPhone: ''
  };

  try {
    const prop = await prisma.property.create({
      data: {
        ...payload,
        agentId: agent.id
      }
    });
    console.log('Created property:', prop.id);
  } catch (err) {
    console.log('Error creating:', err);
  } finally {
    await prisma.$disconnect();
  }
}
run();

