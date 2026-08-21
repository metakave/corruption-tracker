import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Verifying Raw Data Storage...")

    try {
        const count = await prisma.rawNewsArticle.count()
        const processedCount = await prisma.rawNewsArticle.count({ where: { isProcessed: true } })

        console.log(`✅ Total Raw Articles: ${count}`)
        console.log(`🔄 Processed So Far:     ${processedCount} (${Math.round((processedCount / count) * 100)}%)`)

        if (count > 0) {
            const recent = await prisma.rawNewsArticle.findMany({
                take: 5,
                orderBy: { scrapedAt: 'desc' }
            })

            console.log("\nRecent 5 Articles:")
            recent.forEach((a, i) => {
                console.log(`${i + 1}. [${a.source}] ${a.title.substring(0, 40)}... (Scraped: ${a.scrapedAt.toISOString()})`)
            })

            // Check for sources distribution
            const sources = await prisma.rawNewsArticle.groupBy({
                by: ['source'],
                _count: {
                    id: true
                }
            })
            console.log("\n📊 Source Distribution:")
            sources.forEach(s => {
                console.log(`- ${s.source}: ${s._count.id}`)
            })

        } else {
            console.log("❌ No raw articles found yet.")
        }

    } catch (e) {
        console.error("❌ Verification failed:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
