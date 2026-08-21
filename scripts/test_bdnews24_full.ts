
import { BdNews24Scraper } from '../lib/scrapers/bdnews24';

async function test() {
    console.log("🚀 TESTING BdNews24 WITH PAGINATION");
    const scraper = new BdNews24Scraper();

    try {
        const articles = await scraper.scrape();
        console.log(`\n✅ FINAL COUNT: ${articles.length} articles.`);

        if (articles.length > 0) {
            console.log(`Sample: ${articles[0].title}`);
        } else {
            console.log('❌ No articles found. Check proxies/Cloudflare.');
        }

    } catch (error) {
        console.error("FAILED:", error);
    }
}
test();
