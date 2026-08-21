import { PrismaClient } from '@prisma/client'
import { processArticle } from '../lib/event-processor'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function runPipeline() {
    console.log("🚀 Starting Bangladesh Corruption Tracker AI Pipeline...")

    const countBefore = await prisma.corruptionEvent.count({ where: { isCorruption: true } })
    console.log(`   Current Verified Corruption Events: ${countBefore}`)

    const articles = await prisma.rawNewsArticle.findMany({
        where: {
            isProcessed: false
        },
        orderBy: {
            publishedAt: 'desc'
        }
    })

    console.log(`📊 Found ${articles.length} unprocessed news articles in queue.`)

    if (articles.length === 0) {
        console.log("   ✅ Queue is empty. Ready for new crawler articles.")
        return
    }

    let processedCount = 0
    let detectedCorruption = 0

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i]
        console.log(`\n[${i + 1}/${articles.length}] Processing: "${article.title.slice(0, 50)}..." (${article.source})`)

        try {
            const res = await processArticle(article)
            if (res.success) {
                processedCount++
                if (res.created || res.merged) {
                    detectedCorruption++
                    console.log(`   ✅ Corruption Detected & Recorded (Event ID: ${res.eventId || 'merged'})`)
                } else {
                    console.log(`   ℹ️ Not categorized as corruption / Filtered out.`)
                }
            } else {
                console.warn(`   ⚠️ Skipped: ${res.reason}`)
            }
        } catch (err: any) {
            console.error(`   ❌ Error processing article ${article.id}:`, err.message)
        }
    }

    const countAfter = await prisma.corruptionEvent.count({ where: { isCorruption: true } })
    console.log(`\n🎉 Pipeline Run Complete:`)
    console.log(`   - Articles Processed: ${processedCount}`)
    console.log(`   - Corruption Incidents Detected: ${detectedCorruption}`)
    console.log(`   - Total Corruption Events in DB: ${countAfter}`)
}

runPipeline()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
