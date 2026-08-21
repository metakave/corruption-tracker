import { AjkerPatrikaScraper } from '../lib/scrapers/ajkerpatrika';

async function main() {
    console.log("📊 Counting Ajker Patrika Articles (Last 24h)...");
    const scraper = new AjkerPatrikaScraper();
    try {
        const articles = await scraper.scrape();
        console.log(`✅ AJKER_PATRIKA_COUNT: ${articles.length}`);

        if (articles.length > 0) {
            console.log(`   First: ${articles[0].time}`);
            console.log(`   Last:  ${articles[articles.length - 1].time}`);
            console.log('\nSample articles:');
            articles.slice(0, 5).forEach((a, i) => {
                console.log(`   ${i + 1}. ${a.title?.substring(0, 60)}...`);
            });
        }
    } catch (e) {
        console.error("❌ Error:", e);
    }
}

main();
