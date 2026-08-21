
import { IttefaqScraper } from '../lib/scrapers/ittefaq'

async function main() {
    console.log("--- Testing Ittefaq Scraper ---");
    const scraper = new IttefaqScraper();
    try {
        const articles = await scraper.scrape();
        console.log(`Ittefaq returned ${articles.length} articles.`);
        if (articles.length > 0) {
            console.log("First Ittefaq Article:");
            console.log(JSON.stringify(articles[0], null, 2));
            if (!articles[0].publishedAt) {
                console.error("❌ Ittefaq article missing publishedAt!");
            } else {
                console.log("✅ Ittefaq publishedAt is present.");
            }
        }
    } catch (e) {
        console.error("Ittefaq Error:", e);
    }
}

main();
