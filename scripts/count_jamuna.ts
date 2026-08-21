
import { JamunaScraper } from '../lib/scrapers/jamuna';

async function main() {
    console.log("📊 Counting Jamuna Articles (Last 24h)...");
    const scraper = new JamunaScraper();
    try {
        const articles = await scraper.scrape();
        console.log(`✅ JAMUNA_COUNT: ${articles.length}`);
        // Log first and last to verify time range if possible, but count is main goal
        if (articles.length > 0) {
            console.log(`   First: ${articles[0].time}`);
            console.log(`   Last:  ${articles[articles.length - 1].time}`);
        }
    } catch (e) {
        console.error("❌ Error:", e);
    }
}

main();
