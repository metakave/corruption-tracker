
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const BACKUP_DIR = path.join(process.cwd(), 'backups')

async function main() {
    // Find the latest raw_news backup
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('raw_news_') && f.endsWith('.json'))
    if (files.length === 0) {
        console.error("No backup files found!")
        return
    }
    const latestFile = files.sort().reverse()[0]
    const backupPath = path.join(BACKUP_DIR, latestFile)

    console.log(`📦 Restoring Raw News Articles from ${latestFile}...`)
    const rawData = fs.readFileSync(backupPath, 'utf-8')
    const articles = JSON.parse(rawData)

    console.log(`   Found ${articles.length} articles in backup.`)
    console.log("   Starting restoration of 'publishedAt' dates...")

    let restored = 0
    // Batch update? Too risky/complex query. Let's iterate.
    // We only need to fix IF the DB has 'today' but backup has 'historical'
    // Actually, safest is to just upsert everything or update dates.

    // Chunking to avoid memory issues if massive, but 5000 is small.
    for (const article of articles) {
        try {
            await prisma.rawNewsArticle.update({
                where: { url: article.url },
                data: {
                    publishedAt: article.publishedAt // Restore original date
                }
            })
            restored++
            if (restored % 500 === 0) process.stdout.write('.')
        } catch (e) {
            // Ignore if missing (unlikely)
        }
    }

    console.log(`\n✅ Restored dates for ${restored} articles.`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
