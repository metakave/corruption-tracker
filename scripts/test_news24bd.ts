
import { News24BDScraper } from '../lib/scrapers/news24bd';

async function test() {
    console.log("Testing News24BD Scraper...");
    const scraper = new News24BDScraper();

    const start = Date.now();
    const articles = await scraper.scrape();
    const end = Date.now();

    console.log(`\n--- Test Results ---`);
    console.log(`Duration: ${(end - start) / 1000}s`);
    console.log(`Total Articles: ${articles.length}`);

    if (articles.length > 0) {
        console.log("\nFirst 5 Articles:");
        articles.slice(0, 5).forEach((a, i) => {
            console.log(`\n${i + 1}. ${a.title}`);
            console.log(`   URL: ${a.url}`);
            console.log(`   Time: ${a.time}`);
        });
    } else {
        console.log("❌ No articles found. Check selectors/proxy.");
    }
}

test();
