import { processArticle } from '../lib/event-processor'
import { ScrapedArticle } from '../lib/scrapers/types'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
    const url = 'https://www.jugantor.com/country-news/1047043'; // LGED Bribe Video
    console.log(`Testing URL: ${url}`);

    // Mock article
    const article: ScrapedArticle = {
        url,
        title: 'এলজিইডি কর্মকর্তার ঘুস গ্রহণের ভিডিও ভাইরাল!',
        source: 'Jugantor',
        time: 'recent',
        rawTime: 'recent'
    };

    // Force re-process by deleting existing raw entry if present (optional, or just rely on console logs from processArticle)
    // Actually processArticle checks DB. We might need to delete it first to test cleanly or modify processArticle to accept a 'force' flag.
    // For now, let's just delete the raw article if it exists to ensure a fresh fetch.
    try {
        await prisma.rawNewsArticle.delete({ where: { url } });
        console.log('Deleted existing record.');
    } catch (e) {
        console.log('No existing record to delete.');
    }

    await processArticle(article);
}

test()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
