
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const events = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: new Date('2026-01-01T00:00:00.000Z'),
                lt: new Date('2026-02-01T00:00:00.000Z')
            },
            killed: { gt: 0 }
        },
        select: {
            id: true,
            title: true,
            killed: true,
            category: true
        }
    });

    console.log(JSON.stringify(events, null, 2));
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
