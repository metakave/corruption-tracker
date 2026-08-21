
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const events = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: new Date('2026-01-01T00:00:00.000Z'),
                lt: new Date('2026-02-01T00:00:00.000Z')
            },
            killed: { gt: 0 },
            OR: [
                { title: { contains: 'আত্মহত্যা' } }, // Suicide
                { title: { contains: 'দুর্ঘটনা' } }, // Accident
                { title: { contains: 'পারিবারিক' } }, // Family
                { title: { contains: 'বিদ্যুৎস্পৃষ্ট' } }, // Electrocuted
                { title: { contains: 'ডুবে' } }, // Drowning
                { title: { contains: 'বিষপান' } } // Poison
            ]
        },
        select: {
            id: true,
            title: true,
            killed: true
        }
    });

    console.log(`Found ${events.length} potentially irrelevant deadly events.`);
    console.log(JSON.stringify(events, null, 2));
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
