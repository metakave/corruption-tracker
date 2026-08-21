import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking for recent Raw News Articles...")

    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const rawCount = await prisma.rawNewsArticle.count({
        where: {
            scrapedAt: {
                gte: oneDayAgo
            }
        }
    })

    const unprocessedCount = await prisma.rawNewsArticle.count({
        where: {
            scrapedAt: {
                gte: oneDayAgo
            },
            isProcessed: false
        }
    })

    console.log(`📊 Raw Articles in last 24h: ${rawCount}`)
    console.log(`⏳ Unprocessed Articles in last 24h: ${unprocessedCount}`)

    if (unprocessedCount > 0) {
        const sample = await prisma.rawNewsArticle.findFirst({
            where: {
                scrapedAt: { gte: oneDayAgo },
                isProcessed: false
            }
        })
        console.log(`📄 Sample Unprocessed: ${sample?.title} (${sample?.url})`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
