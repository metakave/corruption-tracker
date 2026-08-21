// @ts-nocheck
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Inspecting 'Lawyer Naeem' Event...")

    // Find event by title substring
    const events = await prisma.politicalEvent.findMany({
        where: {
            title: {
                contains: 'আইনজীবী নাঈম' // Lawyer Naeem
            }
        }
    })

    if (events.length === 0) {
        console.log("❌ No event found with that title.")
        return
    }

    for (const event of events) {
        console.log(`\n--------------------------------------------------`)
        console.log(`🆔 ID: ${event.id}`)
        console.log(`📌 Title: ${event.title}`)
        console.log(`🔗 URL: ${event.url}`)
        console.log(`📝 Event RawText (Backup): "${(event.rawText || "").substring(0, 50)}..."`)

        const raw = await prisma.rawNewsArticle.findUnique({
            where: { url: event.url }
        })

        if (raw) {
            console.log(`📄 RawArticle Found!`)
            console.log(`   Title: ${raw.title}`)
            console.log(`   Content Snippet: "${raw.content.substring(0, 100).replace(/\n/g, ' ')}..."`)

            // Check mismatch using naive length or keywords
            if (!raw.content.includes("আইনজীবী") && !raw.content.includes("নাঈম")) {
                console.log(`   ⚠️  POSSIBLE MISMATCH: Content missing title keywords!`)
            }
        } else {
            console.log(`❌ RawArticle NOT FOUND for this URL.`)
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
