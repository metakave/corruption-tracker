import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Searching for events in Feb 2026...");
  // Search particularly on Feb 3, but let's broaden just in case
  const startDate = new Date('2026-02-01T00:00:00.000Z');
  const endDate = new Date('2026-02-28T23:59:59.999Z');

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
      dateOfIncident: true,
    }
  });

  console.log('Found ' + events.length + ' events.');

  for (const event of events) {
    const content = (event.title + ' ' + (event.summary || '')).toLowerCase();
    // Check for Naogaon/Unknown district match or title match
    if (content.includes('bnp') && content.includes('jamaat') && event.injured == 10) {
      console.log('Potential Match ID: ' + event.id);
      console.log('Title: ' + event.title);
      console.log('District: ' + event.district);
      console.log('Injured: ' + event.injured);
      console.log('Date: ' + event.dateOfIncident.toISOString());
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
