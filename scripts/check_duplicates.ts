
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
    console.log("Checking for duplicates and non-violence events...")

    const events = await prisma.politicalEvent.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 100
    })

    console.log(`Loaded ${events.length} events.`)

    // Check for duplicate Titles
    const titleMap = new Map<string, number>()
    const urlMap = new Map<string, number>()

    for (const event of events) {
        titleMap.set(event.title, (titleMap.get(event.title) || 0) + 1)
        urlMap.set(event.url, (urlMap.get(event.url) || 0) + 1)
    }

    console.log("\n--- Duplicate Titles ---")
    for (const [title, count] of titleMap.entries()) {
        if (count > 1) {
            console.log(`[${count}] ${title}`)
        }
    }

    console.log("\n--- Duplicate URLs ---")
    for (const [url, count] of urlMap.entries()) {
        if (count > 1) {
            console.log(`[${count}] ${url}`)
        }
    }

    console.log("\n--- Potential Non-Violence Events (Low Severity) ---")
    const lowSeverity = events.filter(e => (e.severityScore || 0) < 2)
    for (const e of lowSeverity) {
        console.log(`[Score: ${e.severityScore}] ${e.title} (${e.id})`)
    }

    await prisma.$disconnect()
}

checkData().catch(console.error)
