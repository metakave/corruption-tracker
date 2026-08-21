import { SamakalScraper } from '../lib/scrapers/samakal';
import { AjkerPatrikaScraper } from '../lib/scrapers/ajkerpatrika';
import { JamunaScraper } from '../lib/scrapers/jamuna';

async function main() {
    const source = process.argv[2];
    if (!source) {
        console.error('Please specify a source: samakal, ajkerpatrika, or jamuna');
        process.exit(1);
    }

    let scraper;
    if (source === 'samakal') scraper = new SamakalScraper();
    else if (source === 'ajkerpatrika') scraper = new AjkerPatrikaScraper();
    else if (source === 'jamuna') scraper = new JamunaScraper();
    else {
        console.error('Unknown source:', source);
        process.exit(1);
    }

    console.log(`Testing scraper: ${scraper.name}`);
    const articles = await scraper.scrape();
    console.log(`Found ${articles.length} articles.`);
    if (articles.length > 0) {
        console.log('First article:', articles[0]);
        console.log('Last article:', articles[articles.length - 1]);
    }
}

main().catch(console.error);
