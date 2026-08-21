import { ProthomAloScraper } from '../lib/scrapers/prothomalo'
import { DhakaPostScraper } from '../lib/scrapers/dhakapost'

async function test() {
    console.log("🔍 Verifying Reverted Scrapers (Direct Connection)...")

    const prothomalo = new ProthomAloScraper()
    const dhakapost = new DhakaPostScraper()

    try {
        console.log("\n--- Testing Prothom Alo ---")
        const paArticles = await prothomalo.scrape()
        console.log(`✅ Prothom Alo: Found ${paArticles.length} articles`)
        if (paArticles.length > 0) {
            console.log(`   Sample: ${paArticles[0].title} (${paArticles[0].url})`)
        }

        console.log("\n--- Testing Dhaka Post ---")
        const dpArticles = await dhakapost.scrape()
        console.log(`✅ Dhaka Post: Found ${dpArticles.length} articles`)
        if (dpArticles.length > 0) {
            console.log(`   Sample: ${dpArticles[0].title} (${dpArticles[0].url})`)
        }

    } catch (error) {
        console.error("❌ Test failed:", error)
    }
}

test()
