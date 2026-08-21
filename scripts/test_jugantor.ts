
import { JugantorScraper } from '../lib/scrapers/jugantor'

async function main() {
    console.log("--- Testing Jugantor Scraper ---");
    const scraper = new JugantorScraper();
    try {
        const limit = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        const articles = await scraper.scrape(limit);
        console.log(`Jugantor returned ${articles.length} articles.`);
        if (articles.length > 0) {
            console.log("First Jugantor Article:");
            console.log(JSON.stringify(articles[0], null, 2));
            console.log("Last Jugantor Article:");
            console.log(JSON.stringify(articles[articles.length - 1], null, 2));

            if (!articles[0].publishedAt) {
                console.error("❌ Jugantor article missing publishedAt! (Known issue, but focusing on count first)");
            }
        }
    } catch (e) {
        console.error("Jugantor Error:", e);
    }
}

main();
