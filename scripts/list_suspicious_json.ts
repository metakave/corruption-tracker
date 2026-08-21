
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Get suspicious Feb 3 events (those with search URLs or date=Feb 3)
    // We filter for confirmed suspicious ones (e.g. created on that day or search url)
    // Adjust filter as per previous findings: url contains 'search?q='
    const suspiciousEvents = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: new Date('2026-02-03T00:00:00.000Z'),
                lt: new Date('2026-02-04T00:00:00.000Z')
            },
            url: { contains: 'search?q=' }
        },
        select: {
            id: true,
            title: true,
            source: true,
            url: true
        }
    });

    console.log(JSON.stringify(suspiciousEvents, null, 2));
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
