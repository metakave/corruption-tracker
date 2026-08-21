import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzePerformance() {
    console.log('--- SYSTEM PERFORMANCE ANALYSIS ---');

    // 1. Scraper Performance
    const scraperLogs = await prisma.scraperLog.findMany({
        where: { status: 'success', endTime: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    if (scraperLogs.length > 0) {
        let totalScrapeTime = 0;
        let totalNewArticles = 0;

        scraperLogs.forEach(log => {
            if (log.endTime && log.startTime) {
                const duration = (log.endTime.getTime() - log.startTime.getTime()) / 1000;
                totalScrapeTime += duration;
                totalNewArticles += log.newArticles;
            }
        });

        const avgScrapeTime = totalScrapeTime / scraperLogs.length;
        const avgNewArts = totalNewArticles / scraperLogs.length;

        console.log(`\n📡 SCRAPING PERFORMANCE (Last 20 Runs):`);
        console.log(`   - Avg Duration: ${avgScrapeTime.toFixed(2)}s`);
        console.log(`   - Avg New Articles: ${avgNewArts.toFixed(1)} per run`);
        console.log(`   - Scraping Speed: ${(avgNewArts / (avgScrapeTime || 1)).toFixed(2)} articles/sec`);
    }

    // 2. AI Processing Volume
    const totalRaw = await prisma.rawNewsArticle.count();
    const processed = await prisma.rawNewsArticle.count({ where: { isProcessed: true } });
    const pending = totalRaw - processed;

    console.log(`\n🧠 AI PROCESSING VOLUME:`);
    console.log(`   - Total Scraped: ${totalRaw}`);
    console.log(`   - Processed:     ${processed}`);
    console.log(`   - Pending:       ${pending}`);

    // 3. AI Processing Latency (Proxy)
    // We compare RawNewsArticle.scrapedAt with PoliticalEvent.createdAt for matching URLs
    const events = await prisma.politicalEvent.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: { url: true, createdAt: true }
    });

    let totalLatency = 0;
    let latencyCount = 0;

    for (const event of events) {
        const raw = await prisma.rawNewsArticle.findUnique({
            where: { url: event.url }
        });

        if (raw) {
            const latency = (event.createdAt.getTime() - raw.scrapedAt.getTime()) / 1000;
            if (latency > 0 && latency < 3600) { // Limit to 1 hour to avoid catching outliers from backlog runs
                totalLatency += latency;
                latencyCount++;
            }
        }
    }

    if (latencyCount > 0) {
        const avgLatency = totalLatency / latencyCount;
        console.log(`\n⏱️ AI LATENCY (End-to-End):`);
        console.log(`   - Avg Time from Scrape to Event Creation: ${avgLatency.toFixed(2)}s`);
        console.log(`   - Note: This includes the time the article waited in queue.`);
    }

    // 4. Recommendation Calculation
    // interval = ScrapeTime + (NewArticles * AI_Processing_Time_Per_Article)
    // Let's assume AI takes ~8s per article (typical for Gemini Flash)
    const assumedAiTime = 8;
    const avgNew = 30; // Placeholder if no logs
    const avgScrape = 45; // Placeholder

    const scraperStats = scraperLogs.length > 0 ? {
        avgScrape: totalScrapeTime / scraperLogs.length,
        avgNew: totalNewArticles / scraperLogs.length
    } : { avgScrape, avgNew };

    const estimatedCycleTime = scraperStats.avgScrape + (scraperStats.avgNew * assumedAiTime);

    console.log(`\n📋 PIPELINE RECOMMENDATION:`);
    console.log(`   - Estimated Full Cycle: ${(estimatedCycleTime / 60).toFixed(2)} mins`);
    console.log(`   - Theoretical Max Frequency: Every ${(estimatedCycleTime / 60 * 1.2).toFixed(0)} mins (with 20% safety margin)`);
    console.log(`   - Recommended Election Frequency: Every 30 minutes`);
}

analyzePerformance()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
