
import { prisma } from '@/lib/db'

async function main() {
    const titleFragment = "বান্দরবানে পরিত্যক্ত শপিং ব্যাগ থেকে দুটি সাউন্ড গ্রেনেড উদ্ধার"
    console.log(`🔍 Inspecting event for: "${titleFragment}"`)

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
    console.log(`Is Political: ${event.isPoliticalViolence}`)
    console.log(`Political Parties (Raw): ${event.politicalParties}`)
    console.log(`Type of Parties: ${typeof event.politicalParties}`)
}

main().catch(console.error)
