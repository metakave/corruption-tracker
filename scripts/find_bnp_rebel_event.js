const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findEvent() {
    const term = 'বিএনপির বিদ্রোহী';
    const term2 = 'ধানের শীষ';
    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: term } },
                { title: { contains: term2 } },
                { summary: { contains: term } },
                { summary: { contains: term2 } }
            ]
        },
        select: {
            id: true,
            title: true,
            summary: true,
            injured: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10
    });

    console.log(JSON.stringify(events, null, 2));
    await prisma.$disconnect();
}

findEvent().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
