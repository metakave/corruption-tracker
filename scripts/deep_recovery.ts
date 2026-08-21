import { PrismaClient } from '@prisma/client'
import { SamakalScraper } from '../lib/scrapers/samakal'
import { DhakaPostScraper } from '../lib/scrapers/dhakapost'
import { JamunaScraper } from '../lib/scrapers/jamuna'
import { JugantorScraper } from '../lib/scrapers/jugantor'
import { ProthomAloScraper } from '../lib/scrapers/prothomalo'
import { AjkerPatrikaScraper } from '../lib/scrapers/ajkerpatrika'
import { IttefaqScraper } from '../lib/scrapers/ittefaq'
import { News24BDScraper } from '../lib/scrapers/news24bd'

const prisma = new PrismaClient()

async function main() {
    console.log("🌊 STARTING DEEP DATA RECOVERY 🌊")
    console.log("Target Date: Dec 30, 2025")

    // Set Limit to Dec 30, 2025 (Midnight)
    const dateLimit = new Date('2025-12-30T00:00:00.000Z')

    const scrapers = [
        // Phase 1 (Done): Samakal, DhakaPost
        // Phase 2 (Running): Jamuna, Jugantor, ProthomAlo, AjkerPatrika
        // Phase 3 (Added): Ittefaq, News24BD
        new JamunaScraper(),
        new JugantorScraper(),
        new ProthomAloScraper(),
        new AjkerPatrikaScraper(),
        new IttefaqScraper(),
        new News24BDScraper()
    ]

    for (const scraper of scrapers) {
        console.log(`\n--------------------------------------------`)
        console.log(`🔍 Running Deep Scrape for: ${scraper.name}`)
        console.log(`--------------------------------------------`)

        try {
            // Pass dateLimit to scrape method
            const articles = await scraper.scrape(dateLimit)

            console.log(`📦 Fetched ${articles.length} articles from ${scraper.name}`)

            let newCount = 0
            for (const article of articles) {
                // Upsert logic
                // Check if date is valid
                let publishedAt = article.publishedAt ? new Date(article.publishedAt) : new Date()
                if (isNaN(publishedAt.getTime())) publishedAt = new Date()

                await prisma.rawNewsArticle.upsert({
                    where: { url: article.url },
                    update: {}, // Don't overwrite if exists
                    create: {
                        url: article.url,
                        title: article.title,
                        content: article.content || '',
                        publishedAt: publishedAt,
                        scrapedAt: new Date(),
                        source: article.source,
                        isProcessed: false // Important! Let AI pipeline process it.
                    }
                })
                newCount++
            }
            console.log(`✅ Saved/Verified ${newCount} articles to DB.`)

        } catch (e) {
            console.error(`❌ Error scraping ${scraper.name}:`, e)
        }
    }

    console.log("\n🌊 DEEP RECOVERY COMPLETE 🌊")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
