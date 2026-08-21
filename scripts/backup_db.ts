
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const BACKUP_DIR = path.join(process.cwd(), 'backups')

async function main() {
    // Ensure backup dir exists
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    console.log(`📦 Starting Backup at ${timestamp}...`)

    // 1. Backup Political Events
    console.log("   Detailed export of Political Events...")
    const events = await prisma.politicalEvent.findMany()
    const eventsFile = path.join(BACKUP_DIR, `political_events_${timestamp}.json`)
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
    console.log(`   ✅ Saved ${events.length} events to ${eventsFile}`)

    // 2. Backup Raw News Articles
    console.log("   Detailed export of Raw News Articles...")
    const articles = await prisma.rawNewsArticle.findMany()
    const articlesFile = path.join(BACKUP_DIR, `raw_news_${timestamp}.json`)
    fs.writeFileSync(articlesFile, JSON.stringify(articles, null, 2))
    console.log(`   ✅ Saved ${articles.length} raw articles to ${articlesFile}`)

    console.log("\nBackup Completed Successfully.")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
