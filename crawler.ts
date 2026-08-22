import { PrismaClient } from '@prisma/client'
import { ProthomAloScraper } from '../lib/scrapers/prothomalo'
import { AjkerPatrikaScraper } from '../lib/scrapers/ajkerpatrika'
import { SamakalScraper } from '../lib/scrapers/samakal'
import { JugantorScraper } from '../lib/scrapers/jugantor'
// import { DhakaPostScraper } from '../lib/scrapers/dhakapost'
import { processArticle, processArticleMetadata } from '../lib/event-processor'
import { ScrapedArticle } from '../lib/scrapers/types'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

import { JamunaScraper } from '../lib/scrapers/jamuna'

// ... existing imports

async function main() {
    const runId = randomUUID()
    const startTime = new Date()
    const stats = {
        bySource: {} as Record<string, number>,
        totalArticles: 0,
        newArticles: 0,
        duplicates: 0,
        violenceDetected: 0
    }
    const errors: string[] = []

    console.log(`🏁 Starting Multi-Source Crawler... (Run ID: ${runId})`)

    // Create initial ScraperLog entry
    await prisma.scraperLog.create({
        data: {
            runId,
            startTime,
            status: 'running'
        }
    })
    try {
        // Requested Order: Samakal -> Ajker Patrika -> Jamuna TV -> Jugantor -> Prothom Alo
        const scrapers = [
            new SamakalScraper(),
            // new AjkerPatrikaScraper(),
            new JamunaScraper(),
            // new DhakaPostScraper(),
            // new JugantorScraper(),
            // new ProthomAloScraper()
        ]

        const allArticles: ScrapedArticle[] = []

        // 1. Scrape all sources
        console.log("Phase 1: Scraping all sources...")
        for (const scraper of scrapers) {
            try {
                console.log(`\n--- Scraping ${scraper.name} ---`)
                const articles = await scraper.scrape()
                console.log(`✅ ${scraper.name}: Found ${articles.length} articles`)

                // Track articles per source
                stats.bySource[scraper.name] = articles.length
                stats.totalArticles += articles.length

                allArticles.push(...articles)
            } catch (error) {
                const errorMsg = `Error scraping ${scraper.name}: ${error instanceof Error ? error.message : String(error)}`
                console.error(`❌ ${errorMsg}`)
                errors.push(errorMsg)
                stats.bySource[scraper.name] = 0
            }
        }

        // 2. Process gathered articles
        console.log(`\n\nPhase 2: Processing ${allArticles.length} total articles...`)

        // IMPORTANT: Save ALL metadata first to avoid data loss
        console.log(`   💾 Bulk saving ${allArticles.length} metadata records to RawDB...`)
        let savedCount = 0
        const articlesToProcess: ScrapedArticle[] = []

        for (const article of allArticles) {
            try {
                const existing = await prisma.rawNewsArticle.findUnique({
                    where: { url: article.url }
                })

                if (!existing) {
                    await processArticleMetadata(article)
                    savedCount++
                    stats.newArticles++
                    articlesToProcess.push(article)
                } else {
                    stats.duplicates++
                    // Check if it was processed? If needed we can re-process if 'isProcessed' is false
                    if (!existing.isProcessed) {
                        articlesToProcess.push(article)
                    }
                }
            } catch (e) {
                console.error(`Error saving metadata for ${article.url}:`, e)
            }
        }
        console.log(`   ✅ Saved ${savedCount} records to RawNewsArticle.`)
        console.log(`   ⚡ Preparing to AI Analyze ${articlesToProcess.length} new/unprocessed articles...`)

        let processedCount = 0
        for (const article of articlesToProcess) {
            processedCount++
            console.log(`\n[${processedCount}/${articlesToProcess.length}] Processing: ${article.title.substring(0, 50)}...`)
            try {
                const result = await processArticle(article)
                if (result && result.success && (result.created || result.merged)) {
                    stats.corruptionDetected++
                }
            } catch (error) {
                console.error(`Error processing article ${article.url}:`, error)
            }
        }

        console.log("\n🎉 All sources crawled and processed.")

        // Update ScraperLog with success
        await prisma.scraperLog.update({
            where: { runId },
            data: {
                endTime: new Date(),
                status: errors.length > 0 ? 'partial' : 'success',
                sourcesScraped: JSON.stringify(stats.bySource),
                totalArticles: stats.totalArticles,
                newArticles: stats.newArticles,
                duplicates: stats.duplicates,
                corruptionDetected: stats.corruptionDetected,
                errors: errors.length > 0 ? JSON.stringify(errors) : null
            }
        })

        console.log(`\n📊 Final Statistics:`)
        console.log(`   Total Articles: ${stats.totalArticles}`)
        console.log(`   New Articles: ${stats.newArticles}`)
        console.log(`   Duplicates: ${stats.duplicates}`)
        console.log(`   Corruption Incidents Detected: ${stats.corruptionDetected}`)
        console.log(`   Errors: ${errors.length}`)

    } catch (error) {
        // Update ScraperLog with failure
        await prisma.scraperLog.update({
            where: { runId },
            data: {
                endTime: new Date(),
                status: 'failed',
                errors: JSON.stringify([error instanceof Error ? error.message : String(error)])
            }
        })
        throw error
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

