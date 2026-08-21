import { IttefaqScraper } from '../lib/scrapers/ittefaq';

async function testIttefaqLoadMore() {
    console.log("🧪 TESTING Ittefaq with Load More Strategy\n");
    const scraper = new IttefaqScraper();

    try {
        const articles = await scraper.scrape();
        console.log(`\n✅ FINAL COUNT: ${articles.length} articles`);

        if (articles.length >= 100) {
            console.log(`\n🎉 SUCCESS! Achieved 100+ articles (target met)`);
        } else {
            console.log(`\n⚠️  Only ${articles.length} articles (target: 100+)`);
        }

        if (articles.length > 0) {
            console.log(`\nSample articles:`);
            articles.slice(0, 5).forEach((a, i) => {
                console.log(`${i + 1}. ${a.title.substring(0, 60)}...`);
            });
        }

    } catch (error) {
        console.error("❌ TEST FAILED:", error);
    }
}

testIttefaqLoadMore();
