
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const idsToCheck = [
    "6732e4d0-40e8-4629-9d54-b5f6e80b4b20", // Karwan Bazar
    "8aba04e7-4b68-4a1e-b82c-7b77f10b7496"  // Ice Mill
];

async function main() {
    const events = await prisma.politicalEvent.findMany({
        where: { id: { in: idsToCheck } },
        select: {
            id: true,
            title: true,
            killed: true,
            injured: true,
            category: true
        }
    });

    console.log(JSON.stringify(events, null, 2));

    // Sum stats
    const totalKilled = events.reduce((sum, e) => sum + (e.killed || 0), 0);
    const totalInjured = events.reduce((sum, e) => sum + (e.injured || 0), 0);

    console.log(`Total Events: ${events.length}`);
    console.log(`Total Killed: ${totalKilled}`);
    console.log(`Total Injured: ${totalInjured}`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
