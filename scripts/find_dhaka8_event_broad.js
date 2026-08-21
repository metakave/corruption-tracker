const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findEvent() {
    const term = 'ঢাকা-৮';
    const events = await prisma.politicalEvent.findMany({
        where: {
            title: {
                contains: term
            }
        },
        select: {
            id: true,
            title: true,
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
