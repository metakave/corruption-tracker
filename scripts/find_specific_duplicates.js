const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findSpecifics() {
    console.log("🔍 Searching for NEIR and BTRC specifically...");

    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'এনইআইআর' } },
                { summary: { contains: 'এনইআইআর' } },
                { title: { contains: 'NEIR' } },
                { title: { contains: 'বিটিআরসি' } }
            ]
        }
    });

    events.forEach(e => {
        console.log(`ID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`Source: ${e.source}`);
        console.log(`URL: ${e.url}`);
        console.log('-'.repeat(40));
    });
}

findSpecifics()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
