import { DhakaPostScraper } from '../lib/scrapers/dhakapost';
import { JamunaScraper } from '../lib/scrapers/jamuna';

async function testScrapers() {
    console.log("\n🧪 Testing DhakaPost Scraper...");
    try {
        const dhakaScraper = new DhakaPostScraper();
        const dhakaPostArticles = await dhakaScraper.scrape();
        console.log(`✅ DhakaPost: Found ${dhakaPostArticles.length} articles.`);
        if (dhakaPostArticles.length > 0) {
            console.log("Sample Article:", JSON.stringify(dhakaPostArticles[0], null, 2));
        }
    } catch (error) {
        console.error("❌ DhakaPost Failed:", error);
    }

    console.log("\n🧪 Testing Jamuna TV Scraper...");
    try {
        const jamunaScraper = new JamunaScraper();
        const jamunaArticles = await jamunaScraper.scrape();
        console.log(`✅ Jamuna TV: Found ${jamunaArticles.length} articles.`);
        if (jamunaArticles.length > 0) {
            console.log("Sample Article:", JSON.stringify(jamunaArticles[0], null, 2));
        }
    } catch (error) {
        console.error("❌ Jamuna TV Failed:", error);
    }
}

testScrapers();
