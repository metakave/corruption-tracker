
import { prisma } from '@/lib/db'

async function main() {
    console.log("🚀 Starting cleanup of summary reports...")

    const targets = [
        "জানুয়ারিতে মব জাস্টিস ও রাজনৈতিক সহিংসতায় প্রাণহানি বৃদ্ধি",
        "সংখ্যালঘু সম্প্রদায়ের নিরাপত্তাহীনতা: ঐক্য পরিষদের উদ্বেগ",
        "কুমিল্লার চৌদ্দগ্রামে 'ঐক্যবদ্ধ বাংলাদেশ'-এর মিছিলে হামলা ও শেরপুরে নিহতের অভিযোগ"
    ]

    for (const titleFragment of targets) {
        console.log(`\n🔍 Searching for: "${titleFragment}"`)

        const events = await prisma.politicalEvent.findMany({
            where: {
                title: {
                    contains: titleFragment
                }
            }
        })

        if (events.length === 0) {
            console.log("   ❌ No matching events found.")
            continue
        }

        console.log(`   found ${events.length} event(s). Updating to isPoliticalViolence = false...`)

        for (const event of events) {
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    isPoliticalViolence: false
                }
            })
            console.log(`   ✅ Updated ID: ${event.id} | Title: ${event.title}`)
        }
    }

    console.log("\n✨ Cleanup complete.")
}

main().catch(console.error)
