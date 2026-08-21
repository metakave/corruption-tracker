
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const hoursAgo = 48; // Check last 48 hours
        const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

        console.log(`\n🔍 Checking stats for the last ${hoursAgo} hours (since ${since.toISOString()})...\n`);

        // 1. Raw Articles Scraped
        console.log('📊 RAW ARTICLES (Last 48h)');
        console.log('---------------------------');
        const recentArticles = await prisma.rawNewsArticle.groupBy({
            by: ['source'],
            where: {
                scrapedAt: {
                    gte: since
                }
            },
            _count: {
                id: true
            }
        });

        if (recentArticles.length === 0) {
            console.log("❌ No articles scraped in this period.");
        } else {
            recentArticles.forEach(stat => {
                console.log(`${stat.source.padEnd(20)}: ${stat._count.id} articles`);
            });
        }

        // 2. Violence Events Detected
        console.log('\n🚨 VIOLENCE EVENTS DETECTED (Last 48h)');
        console.log('---------------------------');
        const recentViolence = await prisma.politicalEvent.groupBy({
            by: ['source'],
            where: {
                createdAt: {
                    gte: since
                }
            },
            _count: {
                id: true
            }
        });

        if (recentViolence.length === 0) {
            console.log("❌ No violence events detected in this period.");
        } else {
            recentViolence.forEach(stat => {
                console.log(`${stat.source.padEnd(20)}: ${stat._count.id} events`);
            });
        }

        // 3. Drill down into specific sources
        const targets = ['Samakal', 'Ajker Patrika'];

        for (const source of targets) {
            console.log(`\n--- Source Analysis: ${source} ---`);

            const rawCount = await prisma.rawNewsArticle.count({
                where: { source, scrapedAt: { gte: since } }
            });
            console.log(`Raw Articles: ${rawCount}`);

            const processedCount = await prisma.rawNewsArticle.count({
                where: { source, scrapedAt: { gte: since }, isProcessed: true }
            });
            console.log(`Processed:    ${processedCount}`);

            const events = await prisma.politicalEvent.findMany({
                where: { source, createdAt: { gte: since } },
                select: { title: true, createdAt: true, url: true }
            });
            console.log(`Events Created: ${events.length}`);
            if (events.length > 0) {
                events.forEach(e => console.log(`   [${e.createdAt.toISOString()}] ${e.title}`));
            } else {
                console.log(`   (No events created)`);
            }

            // Show sample scraped articles to manually judge titles
            if (rawCount > 0) {
                const sample = await prisma.rawNewsArticle.findMany({
                    where: { source, scrapedAt: { gte: since } },
                    take: 3,
                    orderBy: { scrapedAt: 'desc' },
                    select: { title: true }
                });
                console.log(`   Latest scraped titles:`);
                sample.forEach(s => console.log(`     - ${s.title}`));
            }
        }

    } catch (error) {
        console.error('Error fetching stats:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
