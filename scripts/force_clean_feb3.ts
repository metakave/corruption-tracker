
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const keepIds = [
    "6732e4d0-40e8-4629-9d54-b5f6e80b4b20", // Karwan Bazar
    "8aba04e7-4b68-4a1e-b82c-7b77f10b7496"  // Ice Mill
];

async function main() {
    console.log("Forcing cleanup of Feb 3 anomalies...");

    // Find all suspicious events first to verify count
    const candidates = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: new Date('2026-02-03T00:00:00.000Z'),
                lt: new Date('2026-02-04T00:00:00.000Z')
            },
            url: { contains: 'search?q=' },
            id: { notIn: keepIds } // Exclude the 2 we want to save
        }
    });

    console.log(`Found ${candidates.length} candidates for deletion.`);

    if (candidates.length > 0) {
        const result = await prisma.politicalEvent.deleteMany({
            where: {
                id: { in: candidates.map(c => c.id) }
            }
        });
        console.log(`Successfully deleted ${result.count} events.`);
    }

    // Now fix the kept ones again just in case
    // We update them by finding them explicitly
    // (Note: This logic is redundant if fix_kept_events.ts worked, but safe to repeat)
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
