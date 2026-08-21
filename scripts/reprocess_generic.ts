
import { PrismaClient } from '@prisma/client'
import { processArticle } from '../lib/event-processor'

const prisma = new PrismaClient()

async function main() {
    console.log("🚀 Reprocessing for GENERIC Violence (With Cleanup V2)...")

    const BAD_URL = 'https://www.dhakapost.com/country/421560'
    const TARGET_TITLE_PART = "বস্তাবন্দি মরদেহ"

    // 1. CLEANUP PRIMARY EVENT
    console.log(`\n1. Checking existing primary event: ${BAD_URL}`)
    try {
        const existing = await prisma.politicalEvent.findFirst({
            where: { url: BAD_URL }
        })
        if (existing) {
            await prisma.politicalEvent.delete({ where: { id: existing.id } })
            console.log("   ✅ Deleted existing primary event to force re-analysis.")
        } else {
            console.log("   ℹ️ Primary event not found, clean start.")
        }
    } catch (e) { console.error("Error deleting:", e) }

    // 2. CLEANUP BAD MERGES
    console.log(`\n2. Cleaning up potential bad merges for: 421560`)
    const eventsWithSource = await prisma.politicalEvent.findMany({
        where: { additionalSources: { contains: '421560' } }
    })

    for (const event of eventsWithSource) {
        console.log(`   found in event: "${event.title}"`)
        const sources = JSON.parse(event.additionalSources || '[]')
        const newSources = sources.filter((s: any) => s.url !== BAD_URL)

        if (sources.length !== newSources.length) {
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: { additionalSources: JSON.stringify(newSources) }
            })
            console.log(`   ✅ Removed source from event.`)
        }
    }

    // 3. REPROCESS
    console.log(`\n3. Searching for article: "${TARGET_TITLE_PART}" ---`)

    const article = await prisma.rawNewsArticle.findFirst({
        where: { title: { contains: TARGET_TITLE_PART } }
    })

    if (article) {
        console.log(`[FOUND] ${article.title}`)

        const input = {
            title: article.title,
            url: article.url,
            content: article.content || "",
            time: article.publishedAt?.toISOString() || new Date().toISOString(),
            rawTime: '',
            source: article.source,
            images: []
        }

        console.log("   🔄 Analyzing with DETAILED PROMPT logic...")
        await processArticle(input)

    } else {
        console.log("❌ Article not found.")
    }
}

main()
    .finally(() => prisma.$disconnect())
