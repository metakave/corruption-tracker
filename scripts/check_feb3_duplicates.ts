
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Get all suspicious Feb 3 events (those with search URLs)
    const startOfDay = new Date('2026-02-03T00:00:00.000Z');
    const endOfDay = new Date('2026-02-04T00:00:00.000Z');

    const suspiciousEvents = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: { gte: startOfDay, lt: endOfDay },
            url: { contains: 'search?q=' }
        }
    });

    console.log(`Analyzing ${suspiciousEvents.length} suspicious events from Feb 3...`);
    console.log("---------------------------------------------------");

    let uniqueCount = 0;
    let duplicateCount = 0;

    for (const event of suspiciousEvents) {
        // Simple normalization for title matching
        const normalizedTitle = event.title.trim();

        // Search for POTENTIAL duplicates (excluding self)
        // We look for events with the same title string
        const potentialDuplicates = await prisma.politicalEvent.findMany({
            where: {
                id: { not: event.id },
                title: { contains: normalizedTitle }
            },
            select: { id: true, title: true, dateOfIncident: true, url: true }
        });

        if (potentialDuplicates.length > 0) {
            duplicateCount++;
            console.log(`[DUPLICATE FOUND]`);
            console.log(`  Suspect (Feb 3): ${event.title.substring(0, 50)}...`);
            potentialDuplicates.forEach(dup => {
                console.log(`  -> Match: ${dup.dateOfIncident.toISOString().split('T')[0]} | ID: ${dup.id} | URL: ${dup.url.substring(0, 30)}...`);
            });
        } else {
            uniqueCount++;
            console.log(`[UNIQUE - DO NOT DELETE]`);
            console.log(`  Title: ${event.title}`);
            console.log(`  URL: ${event.url}`);
        }
        console.log("---");
    }

    console.log("---------------------------------------------------");
    console.log(`Summary:`);
    console.log(`Safe to Delete (Duplicates found): ${duplicateCount}`);
    console.log(`Unique Data (Must Fix Date): ${uniqueCount}`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
