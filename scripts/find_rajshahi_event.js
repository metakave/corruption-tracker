const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findEvent() {
    const term = 'রাজশাহী';
    const term2 = 'দুর্গাপুর';
    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: term } },
                { title: { contains: term2 } },
                { locationText: { contains: term } },
                { locationText: { contains: term2 } }
            ]
        },
        select: {
            id: true,
            title: true,
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
