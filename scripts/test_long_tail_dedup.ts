
import { PrismaClient } from '@prisma/client'
import { processArticle } from '../lib/event-processor'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function main() {
    console.log("Testing Long-Tail Deduplication (Smart Retrieval)...")

    // 1. Create an OLD event (30 days ago)
    const oldEventTitle = "Tragic murder of school teacher named Kamal in Bogra"
    const oldEventDate = new Date()
    oldEventDate.setDate(oldEventDate.getDate() - 30)

    // Clean up first
    await prisma.politicalEvent.deleteMany({ where: { title: { contains: "Kamal in Bogra" } } })
    await prisma.rawNewsArticle.deleteMany({ where: { title: { contains: "Kamal in Bogra" } } })

    const oldEvent = await prisma.politicalEvent.create({
        data: {
            title: oldEventTitle,
            url: "https://example.com/old-murder-event",
            source: "Daily Star",
            publishedAt: oldEventDate,
            dateOfIncident: oldEventDate,
            locationText: "Bogra Sadar",
            district: "Bogra", // Important: Same District
            latitude: 24.8481,
            longitude: 89.3730,
            politicalParties: "[]",
            killed: 1,
            injured: 0,
            summary: "School teacher Kamal was hacked to death in Bogra.",
            severityScore: 9,
            confidence: 0.9,
            isPoliticalViolence: true,
            isBangladesh: true
        }
    })
    console.log(`✅ Created Old Event (ID: ${oldEvent.id}) - Date: ${oldEventDate.toISOString().split('T')[0]}`)

    // 2. Process a NEW article (Today) - 30 days later
    // Title shares keyword "Kamal" and "Bogra"
    const newArticle = {
        title: "Running clashes in Bogra over Kamal murder case verdict",
        url: `https://example.com/new-verdict-article-${Date.now()}`,
        time: "Today",
        rawTime: "Today",
        content: "Violent clashes erupted in Bogra after the verdict of school teacher Kamal's murder. Police arrested 3 suspects involved in the original killing last month.",
        images: [],
        source: "Prothom Alo"
    }

    console.log(`\n🔄 Processing New Article (Title: "${newArticle.title}")...`)
    await processArticle(newArticle)

    // 3. Check if it merged
    const updatedOldEvent = await prisma.politicalEvent.findUnique({ where: { id: oldEvent.id } })

    if (updatedOldEvent?.additionalSources?.includes("new-verdict-article")) {
        console.log(`✅ PASSED: New article was MERGED into Old Event!`)
        console.log(`   Sources: ${updatedOldEvent.additionalSources}`)
    } else {
        // Check if a new event was created (Failure case)
        const newEvent = await prisma.politicalEvent.findFirst({ where: { url: newArticle.url } })
        if (newEvent && newEvent.id !== oldEvent.id) {
            console.log(`❌ FAILED: Created Duplicate Event (ID: ${newEvent.id}) instead of merging.`)
        } else {
            console.log(`❓ INCONCLUSIVE: Check output logs.`)
        }
    }

    // Cleanup
    await prisma.politicalEvent.deleteMany({ where: { title: { contains: "Kamal in Bogra" } } })
    await prisma.rawNewsArticle.deleteMany({ where: { title: { contains: "Kamal in Bogra" } } })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
