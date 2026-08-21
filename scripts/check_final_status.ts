
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const startOfDay = new Date('2026-02-03T00:00:00.000Z');
    const endOfDay = new Date('2026-02-04T00:00:00.000Z');

    const remaining = await prisma.politicalEvent.count({
        where: {
            dateOfIncident: { gte: startOfDay, lt: endOfDay },
            url: { contains: 'search?q=' }
        }
    });

    console.log(`Remaining suspicious Feb 3 events: ${remaining}`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
