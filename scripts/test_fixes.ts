
import { SamakalScraper } from '../lib/scrapers/samakal'
import { ProthomAloScraper } from '../lib/scrapers/prothomalo'

async function main() {
    const limit = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago to ensure we get some

    console.log("--- Testing Samakal Scraper ---");
    const samakal = new SamakalScraper();
    try {
        const sArts = await samakal.scrape(limit);
        console.log(`Samakal returned ${sArts.length} articles.`);
        if (sArts.length > 0) {
            console.log("First Samakal Article:");
            console.log(JSON.stringify(sArts[0], null, 2));
            if (!sArts[0].publishedAt) {
                console.error("❌ Samakal article missing publishedAt!");
            } else {
                console.log("✅ Samakal publishedAt is present.");
            }
        }
    } catch (e) {
        console.error("Samakal Error:", e);
    }

    console.log("\n--- Testing Prothom Alo Scraper ---");
    const prothom = new ProthomAloScraper();
    try {
        const pArts = await prothom.scrape(limit);
        console.log(`Prothom Alo returned ${pArts.length} articles.`);
        if (pArts.length > 0) {
            console.log("First Prothom Alo Article:");
            console.log(JSON.stringify(pArts[0], null, 2));
            if (!pArts[0].publishedAt) {
                console.error("❌ Prothom Alo article missing publishedAt!");
            } else {
                console.log("✅ Prothom Alo publishedAt is present.");
            }
        }
    } catch (e) {
        console.error("Prothom Alo Error:", e);
    }
}

main();
