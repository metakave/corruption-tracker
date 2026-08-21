
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const latestLog = await prisma.scraperLog.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (!latestLog) {
            console.log('No run logs found.');
            return;
        }

        console.log('\n📊 LATEST LIVE RUN STATUS');
        console.log('-------------------------');
        console.log(`Run ID:      ${latestLog.runId}`);
        console.log(`Start Time:  ${latestLog.createdAt.toISOString()}`);
        console.log(`Status:      ${latestLog.status.toUpperCase()}`);
        console.log(`Total Found: ${latestLog.totalArticles}`);
        console.log(`New Added:   ${latestLog.newArticles}`);

        console.log('\n🔍 Breakdown by Source:');
        if (latestLog.sourcesScraped) {
            const sources = JSON.parse(latestLog.sourcesScraped as string);
            Object.entries(sources).forEach(([source, count]) => {
                const statusIcon = (count as number) > 0 ? '✅' : '⚠️';
                console.log(`   ${statusIcon} ${source.padEnd(20)}: ${count}`);
            });
        } else {
            console.log('   (No source breakdown available yet - crawler might be in Phase 1)');
        }
        console.log('-------------------------\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
