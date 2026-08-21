import { IttefaqScraper } from '../lib/scrapers/ittefaq';
import { JugantorScraper } from '../lib/scrapers/jugantor';
import { News24BDScraper } from '../lib/scrapers/news24bd';

async function fastVerify() {
    console.log('⚡ FAST VERIFIER STARTING\n');

    const scrapers = [
        new IttefaqScraper(),
        new JugantorScraper(),
        new News24BDScraper()
    ];

    for (const scraper of scrapers) {
        console.log(`\n--- Testing ${scraper.name} ---`);
        try {
            const articles = await scraper.scrape();
            console.log(`✅ ${scraper.name}: Found ${articles.length} articles`);
            if (articles.length > 0) {
                console.log(`Sample: ${articles[0].title} (${articles[0].url})`);
            }
        } catch (e) {
            console.log(`❌ ${scraper.name} Failed:`, e);
        }
    }
}

fastVerify();
