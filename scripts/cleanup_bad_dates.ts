
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🧹 Starting Cleanup of Bad Dates...")

    // 1. Get all Dhaka Post articles from 2026
    const articles = await prisma.rawNewsArticle.findMany({
        where: {
            source: 'Dhaka Post',
            publishedAt: {
                gte: new Date('2026-01-01T00:00:00.000Z')
            }
        },
        select: { id: true, url: true, title: true, publishedAt: true, scrapedAt: true }
    })

    console.log(`Found ${articles.length} potential candidates.`)

    const idsToDelete: number[] = []

    for (const article of articles) {
        if (!article.publishedAt || !article.scrapedAt) continue

        const pub = new Date(article.publishedAt).getTime()
        const scrape = new Date(article.scrapedAt).getTime()
        const diff = Math.abs(pub - scrape)

        // If publishedAt is extremely close to scrapedAt (e.g. within 15 minutes)
        // It means parsing failed and it defaulted to "Now"
        if (diff < 15 * 60 * 1000) {
            console.log(`❌ Identifying BAD DATE: ${article.title.substring(0, 30)}... (Diff: ${diff}ms)`)
            idsToDelete.push(article.id)
        }
    }

    console.log(`⚠️ Found ${idsToDelete.length} articles with invalid 'Today' dates.`)

    if (idsToDelete.length > 0) {
        const result = await prisma.rawNewsArticle.deleteMany({
            where: {
                id: { in: idsToDelete }
            }
        })
        console.log(`✅ Deleted ${result.count} entries.`)
    } else {
        console.log("✅ No bad data found.")
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
