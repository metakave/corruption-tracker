import { BdNews24Scraper } from '../lib/scrapers/bdnews24';

async function testFixed() {
    console.log("🧪 TESTING FIXED BdNews24 Scraper");
    const scraper = new BdNews24Scraper();

    try {
        const articles = await scraper.scrape();
        console.log(`\n✅ FINAL COUNT: ${articles.length} articles`);

        if (articles.length > 0) {
            console.log(`\nSample articles:`);
            articles.slice(0, 5).forEach((a, i) => {
                console.log(`${i + 1}. ${a.title}`);
            });
        }

        if (articles.length >= 50) {
            console.log(`\n🎉 SUCCESS! BdNews24 yielded ${articles.length} articles (target: 50+)`);
        } else {
            console.log(`\n⚠️  Only ${articles.length} articles (target: 50+)`);
        }

    } catch (error) {
        console.error("❌ FAILED:", error);
    }
}

testFixed();
