const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findEvent() {
    const title = 'রাজশাহীর দুর্গাপুরে ভোটকেন্দ্রে দুই প্রার্থীর সমর্থকদের মধ্যে সংঘর্ষ';
    const event = await prisma.politicalEvent.findFirst({
        where: {
            title: title
        },
        select: {
            id: true,
            title: true,
            summary: true,
            injured: true
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
