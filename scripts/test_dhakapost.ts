
import { DhakaPostScraper } from '../lib/scrapers/dhakapost'

async function main() {
    const scraper = new DhakaPostScraper()
    console.log("Testing Dhaka Post Scraper...")
    try {
        const articles = await scraper.scrape()
        console.log("✅ Success!")
        console.log(`Found ${articles.length} articles.`)
        if (articles.length > 0) {
            console.log("First article:", articles[0])
            console.log("Last article:", articles[articles.length - 1])
        }
    } catch (e) {
        console.error("❌ Failed:", e)
    }
}

main()
