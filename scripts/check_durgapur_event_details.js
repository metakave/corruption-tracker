const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEvent() {
    const id = '681335cb-9cfd-4aee-b2b9-e41c463f82e8';
    const event = await prisma.politicalEvent.findUnique({
        where: { id },
        select: { id: true, title: true, summary: true, injured: true, killed: true }
    });

    console.log(JSON.stringify(event, null, 2));
    await prisma.$disconnect();
}

checkEvent().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
