import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking DB Status...");

    // Check connection string (redacted)
    const url = process.env.DATABASE_URL || "NOT_SET";
    console.log(`DATABASE_URL: ${url.replace(/:[^:@]*@/, ':****@')}`);

    const eventCount = await prisma.politicalEvent.count();
    console.log(`PoliticalEvent Count: ${eventCount}`);

    const articleCount = await prisma.rawNewsArticle.count();
    console.log(`RawNewsArticle Count: ${articleCount}`);

    if (eventCount > 0) {
        const lastEvent = await prisma.politicalEvent.findFirst({ orderBy: { createdAt: 'desc' } });
        console.log(`Last Event: ${lastEvent?.title}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
