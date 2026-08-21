const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRawSamples() {
    console.log("🔍 Fetching potential raw samples for testing...");

    // Get a few recent raw articles
    const samples = await prisma.rawNewsArticle.findMany({
        take: 5,
        orderBy: { scrapedAt: 'desc' }
    });

    samples.forEach(s => {
        console.log(`URL: ${s.url}`);
        console.log(`Title: ${s.title}`);
        console.log(`Source: ${s.source}`);
        console.log('-'.repeat(40));
    });

    // Specifically search for the mobile protest ones to test deduplication
    const protestSamples = await prisma.rawNewsArticle.findMany({
        where: {
            OR: [
                { title: { contains: 'মুঠোফোন' } },
                { title: { contains: 'মোবাইল ফোন' } }
            ]
        },
        take: 3
    });

    console.log("\nProtest Samples:");
    protestSamples.forEach(s => {
        console.log(`URL: ${s.url}`);
        console.log(`Title: ${s.title}`);
        console.log('-'.repeat(40));
    });
}

getRawSamples()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
