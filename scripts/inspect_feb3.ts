
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Check for both 2025 and 2026 just in case
    const date2026 = new Date('2026-02-03T00:00:00.000Z');
    const date2025 = new Date('2025-02-03T00:00:00.000Z');

    const events2026 = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: date2026,
                lt: new Date('2026-02-04T00:00:00.000Z')
            }
        },
        select: { id: true, title: true, source: true, dateOfIncident: true, url: true }
    });

    const events2025 = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: date2025,
                lt: new Date('2025-02-04T00:00:00.000Z')
            }
        },
        select: { id: true, title: true, source: true, dateOfIncident: true, url: true }
    });

    console.log(`Events for Feb 3, 2026: ${events2026.length}`);
    if (events2026.length > 0) {
        console.log(JSON.stringify(events2026.slice(0, 5), null, 2)); // Show first 5
        console.log("...");
        console.log(JSON.stringify(events2026.slice(-5), null, 2)); // Show last 5
    }

    console.log(`Events for Feb 3, 2025: ${events2025.length}`);
    if (events2025.length > 0) console.log(JSON.stringify(events2025, null, 2));
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
