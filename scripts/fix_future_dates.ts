
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking for Future Dated Events...")

    // Get today at midnight (start of day? or end of day? Let's use NOW + 1 day buffer)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const futureEvents = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { dateOfIncident: { gt: tomorrow } },
                { publishedAt: { gt: tomorrow } }
            ]
        },
        select: {
            id: true,
            title: true,
            dateOfIncident: true,
            publishedAt: true,
            url: true,
            summary: true
        }
    })

    console.log(`📊 Found ${futureEvents.length} events with dates in the future!`)

    if (futureEvents.length > 0) {
        console.log("--- SAMPLES ---")
        futureEvents.slice(0, 10).forEach(e => {
            console.log(`[${e.dateOfIncident.toISOString().split('T')[0]}] ${e.title}`)
            console.log(`   URL: ${e.url}`)
            console.log(`   Summary: ${e.summary?.slice(0, 100)}...`)
            console.log(`   PublishedAt: ${e.publishedAt.toISOString()}`)
        })

        // Nuke them or Fix them?
        // If they are from the future, they are definitely wrong.
        // We can revert them to 'publishedAt' as a fallback fix.

        console.log("\n🛠 FIXING: Reverting dateOfIncident to publishedAt for these events...")
        for (const e of futureEvents) {
            await prisma.politicalEvent.update({
                where: { id: e.id },
                data: {
                    dateOfIncident: e.publishedAt
                }
            })
            console.log(`   ✅ Fixed ${e.id} -> ${e.publishedAt.toISOString()}`)
        }
    } else {
        console.log("✅ No future events found.")
    }

    // BONUS: Check for very old events that snuck in as "New" (dateOfIncident < 2024 but created recently)
    // Actually the user complaint was about sorting.
    // If we fix the future dates, the real dates (Jan 8, Jan 7) should surface to the top.
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
