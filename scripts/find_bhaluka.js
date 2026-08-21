const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findBhaluka() {
    console.log("🔍 Searching for Bhaluka incident...");

    // The user mentioned "ভালুকায় পোশাকশ্রমিক হত্যা"
    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'ভালুকা' } },
                { title: { contains: 'Bhaluka' } },
                { summary: { contains: 'ভালুকা' } }
            ]
        }
    });

    console.log(`Found ${events.length} events matching Bhaluka.`);
    events.forEach(e => {
        console.log(`\nID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`District: ${e.district}`);
        console.log(`Lat/Lng: ${e.latitude}, ${e.longitude}`);
    });
}

findBhaluka()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
