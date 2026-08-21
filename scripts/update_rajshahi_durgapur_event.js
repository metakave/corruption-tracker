const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEvent() {
    const id = '7ab33cff-7671-47c1-bde5-44ac7125ce3d';
    const newTitle = 'রাজশাহীর দুর্গাপুরে ধানের শীষ ও বিএনপির বিদ্রোহী প্রার্থীর সমর্থকদের মধ্যে সংঘর্ষ';

    const updated = await prisma.politicalEvent.update({
        where: { id },
        data: {
            title: newTitle,
            injured: 0
        }
    });

    console.log(JSON.stringify(updated, null, 2));
    await prisma.$disconnect();
}

updateEvent().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
