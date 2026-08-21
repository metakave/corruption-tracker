import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const totalRaw = await prisma.rawNewsArticle.count();
        const pendingAI = await prisma.rawNewsArticle.count({
            where: { isProcessed: false }
        });
        const processedAI = await prisma.rawNewsArticle.count({
            where: { isProcessed: true }
        });
        const totalEvents = await prisma.politicalEvent.count();

        const recentLogs = await prisma.scraperLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                status: true,
                totalArticles: true,
                newArticles: true,
                violenceDetected: true,
                createdAt: true
            }
        });

        console.log('\n📊 PRODUCTION CRAWL STATISTICS');
        console.log('-------------------------------');
        console.log(`Total Articles Crawled:    ${totalRaw}`);
        console.log(`Processed by AI:           ${processedAI}`);
        console.log(`Pending AI Analysis:       ${pendingAI}`);
        console.log(`Political Events Detected: ${totalEvents}`);
        console.log('\nRecent Scraper Runs:');
        recentLogs.forEach(log => {
            console.log(`- ${log.createdAt.toISOString().slice(0, 16)} | Status: ${log.status.toUpperCase()} | New: ${log.newArticles} | Events: ${log.violenceDetected}`);
        });
        console.log('-------------------------------\n');
    } catch (error) {
        console.error('Error fetching stats:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
