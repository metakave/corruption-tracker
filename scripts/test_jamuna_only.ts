
import { JamunaScraper } from '../lib/scrapers/jamuna';

async function main() {
    console.log("🔥 Starting Isolated Jamuna Test...");
    const scraper = new JamunaScraper();
    try {
        const articles = await scraper.scrape();
        console.log(`✅ Test Complete. Found ${articles.length} articles.`);
        articles.slice(0, 3).forEach(a => console.log(JSON.stringify(a, null, 2)));
    } catch (e) {
        console.error("❌ Test Failed:", e);
    }
}

main();
