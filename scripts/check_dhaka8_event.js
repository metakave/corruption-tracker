const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEvent() {
    const id = '20b49815-dcbb-4f02-9888-786afacd257f';
    const event = await prisma.politicalEvent.findUnique({
        where: { id },
        select: { id: true, title: true, summary: true }
    });

    console.log(JSON.stringify(event, null, 2));
    await prisma.$disconnect();
}

checkEvent().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
