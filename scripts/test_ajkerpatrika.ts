
import { AjkerPatrikaScraper } from '../lib/scrapers/ajkerpatrika'

async function main() {
    const scraper = new AjkerPatrikaScraper()
    console.log("Testing Ajker Patrika Scraper...")
    try {
        const articles = await scraper.scrape()
        console.log("✅ Success!")
        console.log(`Found ${articles.length} articles.`)
        if (articles.length > 0) {
            console.log("First article:", articles[0])
        }
    } catch (e) {
        console.error("❌ Failed:", e)
    }
}

main()
