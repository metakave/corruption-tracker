import { JugantorScraper } from '../lib/scrapers/jugantor';

(async () => {
    console.log('--- Testing Jugantor Filter ---');
    const scraper = new JugantorScraper();
    const articles = await scraper.scrape();
    console.log(`Jugantor returned ${articles.length} articles.`);

    // Check last article date manually if possible/mocked, but here we rely on logs
})();
