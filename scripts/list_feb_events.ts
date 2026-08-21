import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
      injured: true,
      district: true,
      dateOfIncident: true,
    }
  });

  for (const event of events) {
    console.log('ID: ' + event.id + ' | Title: ' + event.title + ' | Injured: ' + event.injured + ' | District: ' + event.district + ' | Date: ' + event.dateOfIncident.toISOString());
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
