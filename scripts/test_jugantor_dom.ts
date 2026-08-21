import { JugantorScraper } from '../lib/scrapers/jugantor';

async function main() {
    console.log('🧪 Testing Jugantor DOM Scraper...');
    const scraper = new JugantorScraper();

    try {
        const articles = await scraper.scrape();
        console.log(`\n✅ Result: Found ${articles.length} articles.`);

        if (articles.length > 0) {
            console.log('Sample Articles:');
            articles.slice(0, 5).forEach((a, i) => {
                console.log(`${i + 1}. [${a.time}] ${a.title}`);
                console.log(`   URL: ${a.url}`);
            });

            console.log(`\nLast Article: [${articles[articles.length - 1].time}] ${articles[articles.length - 1].title}`);
        }

    } catch (e) {
        console.error('Test failed:', e);
    }
}

main();
