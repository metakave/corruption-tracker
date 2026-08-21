import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    console.log("♻️ Starting Data Restoration from restored_data.json...")

    try {
        const rawData = fs.readFileSync('restored_data.json', 'utf8')
        const articles = JSON.parse(rawData)

        console.log(`📊 Found ${articles.length} articles in backup file.`)

        let restoredCount = 0
        let errorCount = 0

        for (const article of articles) {
            try {
                // Prepare data object, omitting ID to let Postgres generate new IDs if needed, 
                // OR keeping ID if we want to preserve history (though typically better to let DB handle IDs if auto-increment)
                // However, Prisma schema might expect ID. SQLite IDs might clash if not 1:1.
                // Let's rely on 'url' as unique identifier and use upsert.

                await prisma.rawNewsArticle.upsert({
                    where: { url: article.url },
                    update: {}, // If exists, do nothing (preserve current state)
                    create: {
                        url: article.url,
                        title: article.title,
                        content: article.content,
                        publishedAt: new Date(article.publishedAt),
                        scrapedAt: new Date(article.scrapedAt),
                        isProcessed: Boolean(article.isProcessed),
                        source: article.source
                    }
                })
                restoredCount++
                if (restoredCount % 100 === 0) process.stdout.write('.')
            } catch (e) {
                errorCount++
                // console.error(`Failed to restore ${article.url}: ${e.message}`)
            }
        }

        console.log(`\n✅ RESTORATION COMPLETE.`)
        console.log(`   Restored: ${restoredCount}`)
        console.log(`   Skipped/Errors: ${errorCount}`)

    } catch (e) {
        console.error("❌ Critical Error during restoration:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
