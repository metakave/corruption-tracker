
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching unique districts...");

    const events = await prisma.politicalEvent.findMany({
        select: {
            district: true
        }
    });

    const distinctDistricts = new Set<string>();
    const counts: Record<string, number> = {};

    for (const ev of events) {
        if (ev.district) {
            const d = ev.district.trim();
            distinctDistricts.add(d);
            counts[d] = (counts[d] || 0) + 1;
        }
    }

    console.log(`Found ${distinctDistricts.size} unique district names.`);
    console.log("List:");

    const sorted = Array.from(distinctDistricts).sort();
    for (const d of sorted) {
        console.log(`${d}: ${counts[d]}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
