
import { prisma } from '@/lib/db'

async function main() {
    const titleFragment = "রাজশাহীতে মাদক কেনার টাকা না পেয়ে মাকে কুপিয়ে হত্যা"
    console.log(`🔍 Inspecting event for: "${titleFragment}"`)

    // Find the event
    const event = await prisma.politicalEvent.findFirst({
        where: {
            title: {
                contains: titleFragment
            }
        },
        select: {
            id: true,
            title: true,
            politicalParties: true,
            isPoliticalViolence: true,
            summary: true
        }
    })

    if (!event) {
        console.log("❌ Event not found")
        return
    }

    console.log("✅ Event Found:")
    console.log(`ID: ${event.id}`)
    console.log(`Title: ${event.title}`)
    console.log(`Is Political: ${event.isPoliticalViolence}`)
    console.log(`Parties (Raw): ${event.politicalParties}`)
}

main().catch(console.error)
