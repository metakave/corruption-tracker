
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Resetting Processed Flags ---');

    // Time of last scraper run: 2026-02-10T17:00:02.704Z
    // Let's target articles scraped after 4:55 PM just to be safe.
    const cutoffTime = new Date('2026-02-10T16:55:00Z');

    try {
        const result = await prisma.rawNewsArticle.updateMany({
            where: {
                scrapedAt: {
                    gte: cutoffTime
                },
                isProcessed: true
            },
            data: {
                isProcessed: false
            }
        });

        console.log(`✅ Reset ${result.count} articles to 'Pending' status.`);

    } catch (error) {
        console.error('Error resetting flags:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
