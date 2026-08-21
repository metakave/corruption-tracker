
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- System Status Report ---');

    try {
        // 1. Last Scraper Run from Logs
        const lastScraperLog = await prisma.scraperLog.findFirst({
            orderBy: { startTime: 'desc' },
        });

        if (lastScraperLog) {
            console.log(`\nCrawler Status (from Log):`);
            console.log(`  Run ID: ${lastScraperLog.runId}`);
            console.log(`  Start Time: ${lastScraperLog.startTime.toISOString()}`);
            console.log(`  End Time: ${lastScraperLog.endTime?.toISOString() || 'Running/Failed'}`);
            console.log(`  Status: ${lastScraperLog.status}`);
            console.log(`  New Articles Found: ${lastScraperLog.newArticles}`);
            console.log(`  Errors: ${lastScraperLog.errors || 'None'}`);
        } else {
            console.log(`\nCrawler Status: No ScraperLog found.`);
        }

        // 2. Last Raw Article Ingested
        const lastArticle = await prisma.rawNewsArticle.findFirst({
            orderBy: { scrapedAt: 'desc' },
            select: { scrapedAt: true, source: true, url: true, isProcessed: true }
        });

        if (lastArticle) {
            console.log(`\nLast Article Ingested:`);
            console.log(`  Scraped At: ${lastArticle.scrapedAt.toISOString()}`);
            console.log(`  Source: ${lastArticle.source}`);
            console.log(`  Processed: ${lastArticle.isProcessed}`);
        }

        // 3. AI Analysis Status (Processing Queue)
        // Checking RawNewsArticle processing status
        const processingStats = await prisma.rawNewsArticle.groupBy({
            by: ['isProcessed'],
            _count: {
                isProcessed: true,
            },
        });

        console.log(`\nAI Processing Queue:`);
        processingStats.forEach(group => {
            console.log(`  ${group.isProcessed ? 'Processed' : 'Pending'}: ${group._count.isProcessed}`);
        });

        // 4. Last Successful Event Analysis
        const lastEvent = await prisma.politicalEvent.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true, title: true }
        });

        if (lastEvent) {
            console.log(`\nLast Successful Analysis Output:`);
            console.log(`  Event Created At: ${lastEvent.createdAt.toISOString()}`);
            console.log(`  Title: ${lastEvent.title}`);
        } else {
            console.log(`\nLast Successful Analysis Output: No events found.`);
        }

    } catch (error) {
        console.error('Error fetching system status:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
