import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function findJashoreDuplicates() {
    console.log('🔍 Finding Jashore BNP leader events...\n')

    // Find all events related to যশোর + BNP + আলমগীর
    const jashoreEvents = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                {
                    district: 'যশোর'
                },
                {
                    title: {
                        contains: 'যশোর'
                    }
                }
            ],
            AND: [
                {
                    title: {
                        contains: 'বিএনপি'
                    }
                }
            ]
        }
    })

    console.log(`Found ${jashoreEvents.length} Jashore BNP events:\n`)

    for (const event of jashoreEvents) {
        console.log(`📋 ID: ${event.id}`)
        console.log(`   Title: ${event.title}`)
        console.log(`   Date: ${event.dateOfIncident?.toISOString().split('T')[0] || 'NULL'}`)
        console.log(`   District: ${event.district}`)
        console.log(`   Killed: ${event.killed}, Injured: ${event.injured}`)
        console.log(`   Source: ${event.source}`)
        console.log(`   URL: ${event.url}`)
        console.log(`   Additional Sources: ${event.additionalSources ? JSON.parse(event.additionalSources).length : 0}\n`)
    }

    // Find events with "আলমগীর" specifically
    const alamgirEvents = jashoreEvents.filter(e => e.title.includes('আলমগীর'))

    if (alamgirEvents.length > 1) {
        console.log(`\n⚠️  Found ${alamgirEvents.length} events mentioning আলমগীর (likely duplicates):\n`)

        for (let i = 0; i < alamgirEvents.length; i++) {
            const event = alamgirEvents[i]
            console.log(`[${i + 1}] ${event.title}`)
            console.log(`    Date: ${event.dateOfIncident?.toISOString().split('T')[0] || 'NULL'}`)
            console.log(`    Source: ${event.source}\n`)
        }

        // Merge them
        if (alamgirEvents.length === 2) {
            const event1 = alamgirEvents[0]
            const event2 = alamgirEvents[1]

            console.log(`\n🔄 Merging these two events...`)

            // Keep whichever has a date, or the first one
            const keepEvent = event1.dateOfIncident ? event1 : event2
            const deleteEvent = event1.dateOfIncident ? event2 : event1

            console.log(`   KEEP: ${keepEvent.title.substring(0, 50)}...`)
            console.log(`   DELETE: ${deleteEvent.title.substring(0, 50)}...`)

            // Add as additional source
            const currentSources = keepEvent.additionalSources ?
                JSON.parse(keepEvent.additionalSources) : []

            if (!currentSources.find((s: any) => s.url === deleteEvent.url)) {
                currentSources.push({
                    url: deleteEvent.url,
                    source: deleteEvent.source,
                    title: deleteEvent.title
                })

                await prisma.politicalEvent.update({
                    where: { id: keepEvent.id },
                    data: { additionalSources: JSON.stringify(currentSources) }
                })
            }

            // Delete duplicate
            await prisma.politicalEvent.delete({ where: { id: deleteEvent.id } })

            console.log(`   ✅ Merged successfully!\n`)
        }
    }

    const finalCount = await prisma.politicalEvent.count()
    console.log(`Final Event Count: ${finalCount}`)
}

findJashoreDuplicates()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
