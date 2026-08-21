
import { IttefaqScraper } from '../lib/scrapers/ittefaq';
import { BdNews24Scraper } from '../lib/scrapers/bdnews24';
import { JamunaScraper } from '../lib/scrapers/jamuna';

async function test() {
    console.log("🚀 STARTING 3-SOURCE TEST RUN (20 PROXIES EACH)\n");

    const scrapers = [
        new IttefaqScraper(),
        new BdNews24Scraper(),
        new JamunaScraper()
    ];

    for (const scraper of scrapers) {
        console.log(`\n--------------------------------------------------`);
        console.log(`📡 TESTING SOURCE: ${scraper.name}`);
        console.log(`--------------------------------------------------`);

        try {
            const articles = await scraper.scrape();
            console.log(`\n✅ [${scraper.name}] FINAL COUNT: ${articles.length} articles found.`);
            if (articles.length > 0) {
                console.log(`   Sample: "${articles[0].title}" (${articles[0].url})`);
            }
        } catch (error) {
            console.error(`❌ [${scraper.name}] FAILED:`, error);
        }
    }

    console.log(`\n--------------------------------------------------`);
    console.log("🏁 TEST RUN COMPLETE");
    console.log(`--------------------------------------------------`);
    process.exit(0);
}

test();
