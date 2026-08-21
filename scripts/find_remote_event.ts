import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Searching for events on Jan 25, 2026...");
  const startDate = new Date('2026-01-25T00:00:00.000Z');
  const endDate = new Date('2026-01-25T23:59:59.999Z');

  const events = await prisma.politicalEvent.findMany({
    where: {
      dateOfIncident: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      title: true,
      summary: true,
      injured: true,
      district: true,
      tags: true,
    }
  });

  console.log('Found ' + events.length + ' events.');

  for (const event of events) {
    const content = (event.title + ' ' + (event.summary || '')).toLowerCase();
    const tags = (event.tags || '').toLowerCase();
    if (content.includes('bnp') || content.includes('jamaat') || tags.includes('bnp') || tags.includes('jamaat')) {
      console.log('Potential Match ID: ' + event.id);
      console.log('Title: ' + event.title);
      console.log('District: ' + event.district);
      console.log('Injured: ' + event.injured);
      console.log('Summary: ' + event.summary);
      console.log('-------------------');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
