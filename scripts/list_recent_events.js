const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listRecentEvents() {
    const events = await prisma.politicalEvent.findMany({
        select: {
            id: true,
            title: true,
            district: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 30
    });

    console.log(JSON.stringify(events, null, 2));
    await prisma.$disconnect();
}

listRecentEvents().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
