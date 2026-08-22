import { PrismaClient } from '@prisma/client'
import { ProthomAloScraper } from '../lib/scrapers/prothomalo'
import { AjkerPatrikaScraper } from '../lib/scrapers/ajkerpatrika'
import { SamakalScraper } from '../lib/scrapers/samakal'
import { JugantorScraper } from '../lib/scrapers/jugantor'
import { DhakaPostScraper } from '../lib/scrapers/dhakapost'
import { JamunaScraper } from '../lib/scrapers/jamuna'
import { processArticle, processArticleMetadata } from '../lib/event-processor'
import { ScrapedArticle } from '../lib/scrapers/types'
import { randomUUID } from 'crypto'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

// Target: 1st August 2026
const AUGUST_1_2026 = new Date('2026-08-01T00:00:00+06:00')

export async function runAugustBackfill() {
    const runId = randomUUID()
    const startTime = new Date()
    console.log(`\n======================================================`)
    console.log(`📅 Starting Sequential Scraping Pipeline from 1st August 2026`)
    console.log(`🕒 Start Time: ${startTime.toISOString()}`)
    console.log(`🆔 Run ID: ${runId}`)
    console.log(`======================================================\n`)

    const stats = {
        bySource: {} as Record<string, number>,
        totalScraped: 0,
        newSaved: 0,
        duplicates: 0,
        corruptionDetected: 0
    }
    const errors: string[] = []

    try {
        await prisma.scraperLog.create({
            data: {
                runId,
                startTime,
                status: 'running'
            }
        })
    } catch {}

    // Ordered sequence of scrapers
    const scrapers = [
        new AjkerPatrikaScraper(),
        new JugantorScraper(),
        new SamakalScraper(),
        new DhakaPostScraper(),
        new ProthomAloScraper(),
        new JamunaScraper()
    ]

    const allArticles: ScrapedArticle[] = []

    // Phase 1: Scrape in sequence
    console.log(`\n--- Phase 1: Scraping Sources Sequentially (Backfill Date: 2026-08-01) ---`)
    for (const scraper of scrapers) {
        try {
            console.log(`\n[Scraper] 🌐 Running ${scraper.name}...`)
            const articles = await scraper.scrape(AUGUST_1_2026)
            console.log(`   ✅ ${scraper.name}: Scraped ${articles.length} articles`)

            stats.bySource[scraper.name] = articles.length
            stats.totalScraped += articles.length
            allArticles.push(...articles)
        } catch (err: any) {
            const msg = `Failed ${scraper.name}: ${err.message}`
            console.error(`   ❌ ${msg}`)
            errors.push(msg)
            stats.bySource[scraper.name] = 0
        }
    }

    // Phase 2: Filter and sort articles by date sequentially
    console.log(`\n--- Phase 2: Sorting & Ingesting ${allArticles.length} Articles ---`)
    
    // Sort chronologically ascending from August 1st onwards
    const sortedArticles = allArticles.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        return dateA - dateB
    })

    const articlesToProcess: ScrapedArticle[] = []

    for (const article of sortedArticles) {
        try {
            const existing = await prisma.rawNewsArticle.findUnique({
                where: { url: article.url }
            })

            if (!existing) {
                await processArticleMetadata(article)
                stats.newSaved++
                articlesToProcess.push(article)
            } else {
                stats.duplicates++
                if (!existing.isProcessed) {
                    articlesToProcess.push(article)
                }
            }
        } catch (e) {
            console.error(`Error checking metadata for ${article.url}:`, e)
        }
    }

    console.log(`   💾 Saved ${stats.newSaved} new articles to RawNewsArticle database.`)
    console.log(`   ⚡ Queue size for OpenRouter AI Intelligence Processing: ${articlesToProcess.length}`)

    // Phase 3: AI Processing in sequence
    let processedCount = 0
    for (let i = 0; i < articlesToProcess.length; i++) {
        const article = articlesToProcess[i]
        processedCount++
        console.log(`\n[${processedCount}/${articlesToProcess.length}] Analyzing: "${article.title.substring(0, 55)}..." (${article.source})`)
        try {
            const result = await processArticle(article)
            if (result && result.success && (result.created || result.merged)) {
                stats.corruptionDetected++
                console.log(`   🚨 Corruption Incident Detected & Categorized (Event ID: ${result.eventId || 'merged'})`)
            } else {
                console.log(`   ⚪ Not corruption / Filtered out`)
            }
        } catch (err: any) {
            console.error(`   ❌ Error analyzing article: ${err.message}`)
        }
    }

    // Update log
    try {
        await prisma.scraperLog.update({
            where: { runId },
            data: {
                endTime: new Date(),
                status: errors.length > 0 ? 'partial' : 'success',
                sourcesScraped: JSON.stringify(stats.bySource),
                totalArticles: stats.totalScraped,
                newArticles: stats.newSaved,
                duplicates: stats.duplicates,
                corruptionDetected: stats.corruptionDetected,
                errors: errors.length > 0 ? JSON.stringify(errors) : null
            }
        })
    } catch {}

    console.log(`\n======================================================`)
    console.log(`🎉 Sequential Ingestion & Scraping Completed`)
    console.log(`   - Total Scraped: ${stats.totalScraped}`)
    console.log(`   - New Raw Articles: ${stats.newSaved}`)
    console.log(`   - Duplicates Merged/Skipped: ${stats.duplicates}`)
    console.log(`   - Verified Corruption Incidents Added: ${stats.corruptionDetected}`)
    console.log(`======================================================\n`)
}

if (require.main === module) {
    runAugustBackfill()
        .catch(e => {
            console.error('Fatal error in August scraper:', e)
            process.exit(1)
        })
        .finally(async () => {
            await prisma.$disconnect()
        })
}
