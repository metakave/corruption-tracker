
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const eventId = "409d2f1b-918f-4358-a734-f8a4626fb960"

    console.log(`\n🔍 Diagnosing Event: ${eventId}`)

    // 1. Fetch the event
    const event = await prisma.politicalEvent.findUnique({
        where: { id: eventId }
    })

    if (!event) {
        console.log("❌ Event NOT FOUND in database!")
        return
    }

    console.log("\n✅ Event Found:")
    console.log(`- Title: ${event.title}`)
    console.log(`- Date: ${event.dateOfIncident}`)
    console.log(`- Published: ${event.publishedAt}`)
    console.log(`- isPoliticalViolence: ${event.isPoliticalViolence}`)
    console.log(`- isBangladesh: ${event.isBangladesh}`)
    console.log(`- Severity: ${event.severityScore}`)
    console.log(`- District: ${event.district}`)

    // 2. Check Feed Conditions
    // The feed logic generally sorts by dateOfIncident desc, publishedAt desc
    const feedSortDate = event.dateOfIncident || event.publishedAt

    console.log(`\n📊 Checking Feed Position (Sort Date: ${feedSortDate.toISOString()})...`)

    // Count how many events are "newer"
    const newerEvents = await prisma.politicalEvent.count({
        where: {
            OR: [
                { dateOfIncident: { gt: feedSortDate } },
                {
                    dateOfIncident: { equals: feedSortDate },
                    publishedAt: { gt: event.publishedAt }
                }
            ]
        }
    })

    console.log(`\n📉 Number of events newer than this one: ${newerEvents}`)

    if (newerEvents >= 50) {
        console.log(`⚠️ CONCLUSION: Event is pushed off the feed limit (50). It is at position ~${newerEvents + 1}.`)
    } else {
        console.log(`✅ CONCLUSION: Event should be visible. It is at position ~${newerEvents + 1}.`)
    }

    // 3. Check for same date events (possible flooding)
    const sameDateCount = await prisma.politicalEvent.count({
        where: {
            dateOfIncident: {
                gte: new Date(feedSortDate.setHours(0, 0, 0, 0)), // Start of that day
                lt: new Date(feedSortDate.setHours(24, 0, 0, 0)) // End of that day
            }
        }
    })
    console.log(`- Total events on that specific day: ${sameDateCount}`)

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
