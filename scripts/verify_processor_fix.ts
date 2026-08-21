
import { processArticle } from '../lib/event-processor';
import { ScrapedArticle } from '../lib/scrapers/types';

async function main() {
    const testArticle: ScrapedArticle = {
        url: 'https://www.ajkerpatrika.com/ajpywx03miwcj', // The "throat slit" article
        title: 'নেত্রকোনায় দুই হাত ঝলসানো ও গলাকাটা যুবকের লাশ উদ্ধার',
        time: '2 days ago', // Dummy
        source: 'Ajker Patrika',
        rawTime: '2 days ago',
        publishedAt: new Date().toISOString()
    };

    console.log("🔍 Verifying Ajker Patrika Processor Fix...");
    try {
        // processArticle returns true/false (or the event creation logic).
        // It logs to console. We will watch the output.
        await processArticle(testArticle);

    } catch (e) {
        console.error("❌ Error running verification:", e);
    }
}

main();
