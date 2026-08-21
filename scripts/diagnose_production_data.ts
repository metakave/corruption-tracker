
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("📊 DIAGNOSIS REPORT")
    console.log("===================")

    // 1. Total Counts
    const totalEvents = await prisma.politicalEvent.count()
    console.log(`\nTotal Political Events in DB: ${totalEvents}`)

    // 2. Breakdown by Source
    const bySource = await prisma.politicalEvent.groupBy({
        by: ['source'],
        _count: {
            id: true
        }
    })
    console.log("\nEvents by Source:")
    bySource.forEach(s => {
        console.log(`  - ${s.source}: ${s._count.id}`)
    })

    // 3. Today's Counts (Server Time)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayEvents = await prisma.politicalEvent.count({
        where: {
            publishedAt: {
                gte: todayStart
            }
        }
    })
    console.log(`\nEvents Published Today (Since ${todayStart.toISOString()}): ${todayEvents}`)

    // 4. Check Raw Articles (Pre-filtering)
    const totalRaw = await prisma.rawNewsArticle.count()
    const todayRaw = await prisma.rawNewsArticle.count({
        where: {
            scrapedAt: {
                gte: todayStart
            }
        }
    })
    console.log(`\nRaw Articles Scraped:`)
    console.log(`  - Total: ${totalRaw}`)
    console.log(`  - Today: ${todayRaw}`)

    // 5. Recent Scraper Logs
    const recentLogs = await prisma.scraperLog.findMany({
        take: 5,
        orderBy: { startTime: 'desc' }
    })
    console.log(`\nRecent Scraper Runs:`)
    recentLogs.forEach(log => {
        console.log(`  - [${log.status}] ${log.startTime.toISOString()} -> ${log.endTime?.toISOString() || 'Running'} (New: ${log.newArticles}, Violence: ${log.violenceDetected})`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
