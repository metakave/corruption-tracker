
import { PrismaClient } from '@prisma/client'
import { processArticle } from '../lib/event-processor'

const prisma = new PrismaClient()

async function main() {
    console.log("🔄 REPROCESSING EXISTING EVENTS ONLY")
    console.log("=".repeat(50))

    // 1. Get all existing events
    const existingEvents = await prisma.politicalEvent.findMany({
        orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${existingEvents.length} existing events in database`)

    // 2. For each event, fetch the corresponding raw article
    const urls = existingEvents.map(e => e.url)

    const rawArticles = await prisma.rawNewsArticle.findMany({
        where: {
            url: { in: urls }
        }
    })

    console.log(`Found ${rawArticles.length} corresponding raw articles`)
    console.log(`Missing raw articles: ${existingEvents.length - rawArticles.length}`)

    console.log("\nStarting reprocessing in 5 seconds... (Press Ctrl+C to cancel)")
    await new Promise(r => setTimeout(r, 5000))

    let processed = 0
    let updated = 0
    let skipped = 0

    for (const rawArticle of rawArticles) {
        processed++
        const progress = ((processed / rawArticles.length) * 100).toFixed(1)
        console.log(`\n[${processed}/${rawArticles.length}] ${progress}% : ${rawArticle.title.substring(0, 60)}...`)

        try {
            const pArticle = {
                title: rawArticle.title,
                url: rawArticle.url,
                content: rawArticle.content || "",
                time: rawArticle.publishedAt.toISOString(),
                rawTime: '',
                source: rawArticle.source,
                images: []
            }

            // Force update existing events
            const result = await processArticle(pArticle, true)

            if (result) {
                updated++
            } else {
                skipped++
            }

        } catch (e) {
            console.error(`❌ Error:`, e)
            skipped++
        }
    }

    console.log("\n" + "=".repeat(50))
    console.log(`COMPLETED.`)
    console.log(`  Total Processed: ${processed}`)
    console.log(`  Updated: ${updated}`)
    console.log(`  Skipped: ${skipped}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
