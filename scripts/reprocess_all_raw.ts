
import { PrismaClient } from '@prisma/client'
import { processArticle } from '../lib/event-processor'

const prisma = new PrismaClient()

async function main() {
    console.log("🚀 STARTING FULL RE-VERIFICATION OF RAW ARTICLES")
    console.log("===============================================")

    // 1. Get total count
    const totalCount = await prisma.rawNewsArticle.count()
    console.log(`Total Raw Articles in DB: ${totalCount}`)

    // 2. Fetch recent articles (last 45 days) to save costs/time on historical ones
    // The AI prompt has a 30-day "Active" cut-off anyway.
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 45)

    console.log(`Fetching articles published after: ${cutoffDate.toISOString()}...`)

    const articles = await prisma.rawNewsArticle.findMany({
        where: {
            publishedAt: {
                gte: cutoffDate
            }
        },
        orderBy: { publishedAt: 'desc' }
    })

    console.log(`\nFound ${articles.length} RECENT articles to re-verify.`)
    console.log(`(Skipping ${totalCount - articles.length} older articles as they would fail the 'Recent' check)`)

    console.log("\nStarting processing in 5 seconds... (Press Ctrl+C to cancel)")
    await new Promise(r => setTimeout(r, 5000))

    let processed = 0
    let violenceFound = 0

    for (const article of articles) {
        processed++
        const progress = ((processed / articles.length) * 100).toFixed(1)
        console.log(`\n[${processed}/${articles.length}] ${progress}% : ${article.title.substring(0, 60)}...`)

        try {
            // OPTIMIZATION: Skip articles already detected as violence
            // Only re-process articles that were skipped/rejected before
            const existingEvent = await prisma.politicalEvent.findUnique({
                where: { url: article.url }
            })

            if (existingEvent) {
                console.log(`   ⏭️  Already detected as violence, skipping...`)
                continue
            }

            const pArticle = {
                title: article.title,
                url: article.url,
                content: article.content || "",
                time: article.publishedAt.toISOString(),
                rawTime: article.publishedAt.toISOString(), // Fix: Pass valid date string
                source: article.source,
                images: []
            }

            // Pass forceUpdate = true to rewrite titles for existing events
            await processArticle(pArticle, true)

        } catch (e) {
            console.error(`❌ Error processing ${article.id}:`, e)
        }
    }

    console.log("\n===============================================")
    console.log(`COMPLETED. Processed: ${processed}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
