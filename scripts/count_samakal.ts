import { SamakalScraper } from '../lib/scrapers/samakal';

async function main() {
    console.log('📊 Counting Samakal Articles (Last 24h)...\n');

    const scraper = new SamakalScraper();
    const articles = await scraper.scrape();

    console.log(`\n✅ SAMAKAL_COUNT: ${articles.length}`);
    if (articles.length > 0) {
        console.log(`   First: ${articles[0].time}`);
        console.log(`   Last:  ${articles[articles.length - 1].time}`);

        console.log('\nSample articles:');
        articles.slice(0, 5).forEach((a, i) => {
            console.log(`   ${i + 1}. ${a.title.substring(0, 60)}...`);
        });
    }
}

main();
