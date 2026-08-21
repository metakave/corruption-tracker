
import { processArticle } from '../lib/event-processor';
import { ScrapedArticle } from '../lib/scrapers/types';

async function main() {
    const testArticle: ScrapedArticle = {
        url: 'https://samakal.com/whole-country/article/332257/%E0%A6%8B%E0%A6%A3%E0%A6%96%E0%A7%87%E0%A6%B2%E0%A6%BE%E0%A6%AA%E0%A6%BF-%E0%A6%AD%E0%A7%8B%E0%A6%9F%E0%A6%BE%E0%A6%B0-%E0%A6%A4%E0%A6%A5%E0%A7%8D%E0%A6%AF%E0%A7%87-%E0%A6%97%E0%A6%B0%E0%A6%AE%E0%A6%BF%E0%A6%B2-%E0%A6%A5%E0%A6%BE%E0%A6%95%E0%A6%BE%E0%A7%9F-%E0%A6%AC%E0%A6%BE%E0%A6%97%E0%A7%87%E0%A6%B0%E0%A6%B9%E0%A6%BE%E0%A6%9F%E0%A7%87-%E0%A7%ab-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A5%E0%A7%80%E0%A6%B0-%E0%A6%AE%E0%A6%A8%E0%A7%8B%E0%A6%A8%E0%A6%AF%E0%A6%BC%E0%A6%A8-%E0%A6%AC%E0%A6%BE%E0%A6%A4%E0%A6%BF%E0%A6%B2',
        title: 'Samakal Test Article',
        time: '2 hours ago',
        source: 'Samakal',
        rawTime: '2 hours ago',
        publishedAt: new Date().toISOString()
    };

    console.log("🔍 Verifying Samakal Processor Fix...");
    try {
        await processArticle(testArticle);
    } catch (e) {
        console.error("❌ Error running verification:", e);
    }
}

main();
