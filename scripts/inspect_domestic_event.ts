
import { prisma } from '@/lib/db'

async function main() {
    const titleFragment = "টেকনাফে নামাজরত অবস্থায় পুত্রবধূর"
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
            politicalParties: true, // This is the key field causing the issue
            isPoliticalViolence: true
        }
    })

    if (!event) {
        console.log("❌ Event not found")
        return
    }

    console.log("✅ Event Found:")
    console.log(`ID: ${event.id}`)
    console.log(`Title: ${event.title}`)
    console.log(`Parties (Raw): ${event.politicalParties}`)
}

main().catch(console.error)
