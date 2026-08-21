const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findPotentialDuplicates() {
    console.log("🔍 Searching for Mobile Businessmen protest events...");

    // Search for events on Jan 4 and Jan 1 related to mobile traders
    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'মুঠোফোন' } },
                { title: { contains: 'মোবাইল ফোন' } },
                { title: { contains: 'ব্যবসায়ী' } },
                { title: { contains: 'ব্যবসায়ী' } },
                { summary: { contains: 'মুঠোফোন' } },
                { summary: { contains: 'বিটিআরসি' } }
            ]
        },
        orderBy: { dateOfIncident: 'desc' }
    });

    console.log(`Found ${events.length} potential matches.\n`);

    events.forEach(e => {
        console.log(`ID: ${e.id}`);
        console.log(`Date: ${e.dateOfIncident}`);
        console.log(`Title: ${e.title}`);
        console.log(`District: ${e.district}`);
        console.log(`Source: ${e.source}`);
        console.log(`Additional Sources: ${e.additionalSources}`);
        console.log(`Summary: ${e.summary?.substring(0, 100)}...`);
        console.log('-'.repeat(40));
    });
}

findPotentialDuplicates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
