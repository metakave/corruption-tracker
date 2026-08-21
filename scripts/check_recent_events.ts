import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking recent Political Events in Database...")

    // Get last 15 events sorted by creation time (most recent first)
    const events = await prisma.politicalEvent.findMany({
        take: 15,
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            title: true,
            dateOfIncident: true,
            severityScore: true,
            confidence: true,
            district: true,
            locationText: true,
            createdAt: true,
            isPoliticalViolence: true
        }
    })

    if (events.length === 0) {
        console.log("❌ No political events found in the database.")
        return
    }

    console.log(`✅ Found ${events.length} recent events:\n`)

    events.forEach((e, i) => {
        console.log(`${i + 1}. [${e.createdAt.toISOString()}] ${e.title.substring(0, 50)}...`)
        console.log(`   📅 Incident: ${e.dateOfIncident?.toISOString().split('T')[0]} | 📍 ${e.district} - ${e.locationText}`)
        console.log(`   🔥 Severity: ${e.severityScore}/10 | 🤖 Confidence: ${e.confidence}`)
        console.log('---')
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
