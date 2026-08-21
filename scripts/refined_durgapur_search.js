const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function exactSearch() {
    const text = 'রাজশাহীর দুর্গাপুরে ধানের শীষ ও বিএনপির বিদ্রোহী প্রার্থীর সমর্থকদের মধ্যে সংঘর্ষ';
    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'দুর্গাপুর' } },
                { title: { contains: 'ধানের শীষ' } },
                { summary: { contains: 'দুর্গাপুর' } },
                { summary: { contains: 'বিএনপির বিদ্রোহী' } }
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

exactSearch().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
