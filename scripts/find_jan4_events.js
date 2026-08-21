const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findJan4Events() {
    console.log("🔍 Searching for all events on Jan 4, 2026...");

    const startOfDay = new Date('2026-01-04T00:00:00Z');
    const endOfDay = new Date('2026-01-04T23:59:59Z');

    const events = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        orderBy: { title: 'asc' }
    });

    console.log(`Found ${events.length} events on Jan 4.\n`);

    events.forEach(e => {
        console.log(`ID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`Source: ${e.source}`);
        console.log(`URL: ${e.url}`);
        console.log('-'.repeat(40));
    });
}

findJan4Events()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
