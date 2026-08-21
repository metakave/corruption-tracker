import { News24BDScraper } from '../lib/scrapers/news24bd';

async function testNews24BD() {
    console.log('🧪 ISOLATED TEST: News24BD Scraper\n');

    const scraper = new News24BDScraper();

    const start = Date.now();
    const result = await scraper.scrape();
    const end = Date.now();

    console.log('\n' + '='.repeat(60));
    console.log('RESULTS:');
    console.log('='.repeat(60));
    console.log(`Duration: ${((end - start) / 1000).toFixed(1)}s`);
    console.log(`Articles returned: ${result.length}`);

    if (result.length > 0) {
        console.log('\nFirst 3 articles:');
        result.slice(0, 3).forEach((a, i) => {
            console.log(`\n${i + 1}. ${a.title}`);
            console.log(`   URL: ${a.url}`);
            console.log(`   Content length: ${a.content.length} chars`);
            console.log(`   Images: ${a.images.length}`);
        });
    } else {
        console.log('\n❌ NO ARTICLES RETURNED');
    }
}

testNews24BD();
