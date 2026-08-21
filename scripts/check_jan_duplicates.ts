
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
            killed: true
        }
    });

    // Check for duplicate titles
    const titleMap = new Map();
    const duplicates = [];

    for (const e of events) {
        // Normalize title: remove spaces, lowercase
        const norm = e.title.replace(/\s+/g, '').toLowerCase();
        if (titleMap.has(norm)) {
            duplicates.push({ original: titleMap.get(norm), duplicate: e });
        } else {
            titleMap.set(norm, e);
        }
    }

    console.log(`Found ${duplicates.length} duplicate deadly pairs.`);
    console.log(JSON.stringify(duplicates, null, 2));

    // If matches is 2, those are our candidates!
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
