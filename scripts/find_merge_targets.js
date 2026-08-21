const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findEvents() {
    console.log("🔍 Searching for Farmgate/Tejgaon College events on 2026-01-04...");

    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'তেজগাঁও' } },
                { title: { contains: 'ফার্মগেট' } },
                { summary: { contains: 'তেজগাঁও' } },
                { summary: { contains: 'ফার্মগেট' } }
            ],
            dateOfIncident: {
                gte: new Date('2026-01-01T00:00:00Z'),
                lt: new Date('2026-01-07T00:00:00Z')
            }
        }
    });

    console.log(`Found ${events.length} events matching keywords.`);
    events.forEach(e => {
        console.log(`\nID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`Source: ${e.source}`);
        console.log(`URL: ${e.url}`);
    });
}

findEvents()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
