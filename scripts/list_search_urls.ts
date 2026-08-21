
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { url: { contains: 'search?q=' } },
                { url: { contains: 'search?query=' } },
                { url: { contains: 'google.com' } }
            ]
        },
        select: { id: true, title: true, source: true, url: true }
    });

    console.log(`Found ${events.length} events with search URLs.`);
    fs.writeFileSync('search_urls.json', JSON.stringify(events, null, 2));
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
