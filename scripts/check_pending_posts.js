const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPendingPosts() {
    const pendingPosts = await prisma.socialMediaPost.findMany({
        where: {
            status: 'PENDING'
        },
        include: {
            event: {
                select: {
                    id: true,
                    title: true,
                    district: true,
                    summary: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 20
    });

    const results = pendingPosts.map(post => ({
        postId: post.id,
        eventId: post.event.id,
        title: post.event.title,
        district: post.event.district,
        summary: post.event.summary
    }));

    console.log(JSON.stringify(results, null, 2));
    await prisma.$disconnect();
}

checkPendingPosts().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
