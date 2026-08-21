import { PrismaClient } from '@prisma/client'
import { processArticle } from '../lib/event-processor'
import { ScrapedArticle } from '../lib/scrapers/types'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

const prisma = new PrismaClient()

// Price per request estimate for Gemini 2.0/2.5 Flash Lite
// Based on $0.10 per 1k articles (roughly $0.0001 per article)
const SAVINGS_PER_ARTICLE = 0.0001

async function reprocessFailedArticles() {
    console.log('🔄 Reprocessing Failed Articles Pipeline (Stats Tracking Edition)\n')

    const auditLogPath = path.join(process.cwd(), 'logs', 'pending_failures.csv')
    if (!fs.existsSync(auditLogPath)) {
        console.error('❌ Pending failures CSV not found at:', auditLogPath)
        return
    }

    console.log('🔍 Fetching existing success URLs...')
    const successfulEvents = await prisma.politicalEvent.findMany({
        select: { url: true }
    })
    const successfulUrls = new Set(successfulEvents.map(e => e.url))
    console.log(`✅ Found ${successfulUrls.size} existing events.`)

    const fileStream = fs.createReadStream(auditLogPath)
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    const failedUrls = new Set<string>()
    let totalLinesInLog = 0

    for await (const line of rl) {
        if (!line.trim()) continue
        totalLinesInLog++
        const match = line.match(/"([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)"/)
        if (!match) continue
        const [, , , url, , trace] = match

        // Only reprocess if it was an actual failure, not an intentional skip
        const isActualFailure = trace.includes("Analysis Failed") ||
            trace.includes("Browser fetch failed") ||
            trace.includes("Quota exhausted") ||
            trace.includes("AI returned null");

        if (isActualFailure && !successfulUrls.has(url)) {
            failedUrls.add(url)
        }
    }

    const allPendingUrls = Array.from(failedUrls)
    console.log(`📊 Filtered by success: ${allPendingUrls.length}`)

    // Pre-filter by Date to give user accurate "how much"
    console.log('📅 Filtering for articles scraped Jan 1st - Feb 10th in chunks...')
    const filteredArticles: { url: string }[] = []
    const CHUNK_SIZE = 500
    for (let i = 0; i < allPendingUrls.length; i += CHUNK_SIZE) {
        const chunk = allPendingUrls.slice(i, i + CHUNK_SIZE)
        const articles = await prisma.rawNewsArticle.findMany({
            where: {
                url: { in: chunk },
                scrapedAt: {
                    gte: new Date('2026-01-01T00:00:00Z'),
                    lte: new Date('2026-02-10T23:59:59Z')
                }
            },
            select: { url: true }
        })
        filteredArticles.push(...articles)
    }

    const urlsToProcess = filteredArticles.map(a => a.url)
    console.log(`📊 Unique Pending (Jan-Feb): ${urlsToProcess.length}\n`)

    if (urlsToProcess.length === 0) {
        console.log('✅ No articles found in the specified date range!')
        if (allPendingUrls.length > 0) {
            console.log(`🔍 Debug: Checking database for first URL: ${allPendingUrls[0]}`)
            const debugArticle = await prisma.rawNewsArticle.findUnique({
                where: { url: allPendingUrls[0] }
            })
            if (debugArticle) {
                console.log(`   ✅ Found article in DB! ScrapedAt: ${debugArticle.scrapedAt.toISOString()}, isProcessed: ${debugArticle.isProcessed}`)
            } else {
                console.log('   ❌ Article NOT found in DB at all.')
            }
        }
        return
    }

    let processedTotal = 0
    let successCount = 0
    let skippedByUrlCount = 0
    let aiAnalyzedCount = 0

    const BATCH_SIZE = 100

    console.log(`🚀 Starting optimized run of ${urlsToProcess.length} items...\n`)

    for (let i = 0; i < urlsToProcess.length; i += BATCH_SIZE) {
        const batchUrls = urlsToProcess.slice(i, i + BATCH_SIZE)

        const articles = await prisma.rawNewsArticle.findMany({
            where: {
                url: { in: batchUrls },
                scrapedAt: {
                    gte: new Date('2026-01-01T00:00:00Z'),
                    lte: new Date('2026-02-10T23:59:59Z')
                }
            }
        })

        for (const article of articles) {
            processedTotal++

            try {
                const scrapedArticle: ScrapedArticle = {
                    title: article.title,
                    url: article.url,
                    content: article.content,
                    time: article.publishedAt.toISOString(),
                    rawTime: article.publishedAt.toISOString(),
                    source: article.source,
                    images: []
                }

                // processArticle returns the analysis object on success, false on skip
                const result = await processArticle(scrapedArticle, false)

                if (result === false) {
                    skippedByUrlCount++
                } else if (result) {
                    successCount++
                    aiAnalyzedCount++
                } else {
                    // Logic skip (already in DB)
                }

            } catch (error) {
                console.error(`   ❌ Loop Error: ${error}`)
            }

            // Periodic status update
            if (processedTotal % 20 === 0 || processedTotal === urlsToProcess.length) {
                const percent = ((processedTotal / urlsToProcess.length) * 100).toFixed(1)
                const totalSaved = (skippedByUrlCount * SAVINGS_PER_ARTICLE).toFixed(4)

                console.log(`\n---------------------------------------------------------`)
                console.log(`📈 PROGRESS: ${processedTotal}/${urlsToProcess.length} (${percent}%)`)
                console.log(`   ✅ Successes (AI): ${successCount}`)
                console.log(`   ⏭️  URL Skips: ${skippedByUrlCount}`)
                console.log(`   💰 Estimated Savings: $${totalSaved}`)
                console.log(`---------------------------------------------------------\n`)
            }

            // High speed delay
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`\n📊 FINAL STATS:`)
    console.log(`   Total Processed: ${processedTotal}`)
    console.log(`   AI Analyzed: ${aiAnalyzedCount}`)
    console.log(`   URL Skips: ${skippedByUrlCount}`)
    console.log(`   Successes: ${successCount}`)
    console.log(`   Total Savings: $${(skippedByUrlCount * SAVINGS_PER_ARTICLE).toFixed(4)}`)
    console.log('\n' + '='.repeat(60))
}

reprocessFailedArticles()
    .then(() => console.log('✅ Finished.'))
    .catch((err) => console.error('💥 Fatal:', err))
    .finally(async () => {
        await prisma.$disconnect()
        process.exit(0)
    })
