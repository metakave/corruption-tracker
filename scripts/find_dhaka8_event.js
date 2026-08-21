const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findEvent() {
    const titlePart = 'ঢাকা-৮ আসনে জামায়াত প্রার্থীর ওপর হামলার চেষ্টা';
    const event = await prisma.politicalEvent.findFirst({
        where: {
            title: {
                contains: titlePart
            }
        },
        select: {
            id: true,
            title: true,
            summary: true
        }
    });

    console.log(JSON.stringify(event, null, 2));
    await prisma.$disconnect();
}

findEvent().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
