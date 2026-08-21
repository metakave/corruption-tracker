
require('dotenv').config()
import { PrismaClient } from '@prisma/client'
import { analyzeWithAI } from '../lib/ai-analysis'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking for specific JUNE 2026 hallucinations...")

    // 1. Check for the specific user reported URL
    const specificUrl = "https://www.ajkerpatrika.com/bangladesh/chapainawabganj/ajpa9oqgrv63u"
    const specificEvent = await prisma.politicalEvent.findFirst({
        where: { url: specificUrl }
    })

    if (specificEvent) {
        console.log(`📌 Found User Reported Event: ${specificEvent.title}`)
        console.log(`   ID: ${specificEvent.id}`)
        console.log(`   Current Incident Date: ${specificEvent.dateOfIncident?.toISOString()}`)

        // Fix it
        await fixEvent(specificEvent)
    } else {
        console.log("⚠️ Could not find the specific event by exact URL. Searching by substring 'ajpa9oqgrv63u'...")
        const partial = await prisma.politicalEvent.findFirst({
            where: { url: { contains: 'ajpa9oqgrv63u' } }
        })
        if (partial) {
            console.log(`📌 Found Partial Match: ${partial.title}`)
            await fixEvent(partial)
        } else {
            console.log("❌ Definitely could not find that specific event in DB. Maybe scraper failed to save it initially or it was deleted?")
        }
    }

    // 2. Scan ALL events for Future Dates (Focus on May/June 2026)
    const futureDate = new Date('2026-02-01T00:00:00Z')
    const futureEvents = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: { gt: futureDate }
        }
    })

    console.log(`\n📊 Found ${futureEvents.length} other events with dates > Feb 2026.`)
    for (const event of futureEvents) {
        await fixEvent(event)
    }
}

async function fixEvent(event: any) {
    console.log(`   🔄 Re-analyzing Event ${event.id}...`)

    // Construct text
    const text = event.rawText || (event.summary + " " + event.title);

    try {
        const analysis = await analyzeWithAI(
            text.slice(0, 5000),
            event.title,
            event.url,
            event.publishedAt.toISOString().split('T')[0],
            event.source
        );

        if (analysis && analysis.incident_date) {
            console.log(`      ✅ New Date Algorithm Output: ${analysis.incident_date}`)

            // Validate against current DB
            const newDate = new Date(analysis.incident_date)
            // Just updated
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    dateOfIncident: newDate,
                    tags: JSON.stringify([...JSON.parse(event.tags || '[]'), 'Future-Date-Fixed'])
                }
            })
            console.log(`      ✏️ Database Updated.`)
        } else {
            console.log(`      ❌ AI Analysis returned null or no date.`)
        }
    } catch (e) {
        console.error(`      ⚠️ Error fixing event: ${e}`)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
