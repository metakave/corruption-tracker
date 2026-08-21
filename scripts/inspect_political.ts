
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Fetch 20 random 'political' events
    // Since we can't do random easily efficiently, we take latest 50 and pick random or just first 20.
    const events = await prisma.politicalEvent.findMany({
        where: {
            category: {
                contains: 'political' // string search in JSON
            }
        },
        take: 30,
        select: {
            id: true,
            title: true,
            summary: true,
            politicalParties: true,
            isPoliticalViolence: true
        }
    });

    console.log(`Found ${events.length} Political events. Here are samples:`);
    console.log("---------------------------------------------------");

    events.forEach((e, i) => {
        console.log(`[${i + 1}] Title: ${e.title}`);
        console.log(`Summary: ${e.summary?.substring(0, 100)}...`);
        console.log(`Parties: ${e.politicalParties} | IsPoliticalDB: ${e.isPoliticalViolence}`);
        console.log("---------------------------------------------------");
    });
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
