const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepSearch() {
    const terms = ['Rajshahi', 'রাজশাহী', 'Durgapur', 'দুর্গাপুর', 'বিদ্রোহী', 'Rebel'];
    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'Rajshahi', mode: 'insensitive' } },
                { title: { contains: 'রাজশাহী' } },
                { title: { contains: 'Durgapur', mode: 'insensitive' } },
                { title: { contains: 'দুর্গাপুর' } },
                { title: { contains: 'বিদ্রোহী' } },
                { title: { contains: 'Rebel', mode: 'insensitive' } },
                { summary: { contains: 'Rajshahi', mode: 'insensitive' } },
                { summary: { contains: 'রাজশাহী' } },
                { summary: { contains: 'Durgapur', mode: 'insensitive' } },
                { summary: { contains: 'দুর্গাপুর' } },
                { summary: { contains: 'বিদ্রোহী' } },
                { summary: { contains: 'Rebel', mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            title: true,
            district: true,
            summary: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    console.log(JSON.stringify(events, null, 2));
    await prisma.$disconnect();
}

deepSearch().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
