import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function mergeBTRCDuplicates() {
    console.log('🔍 Finding BTRC attack duplicates...\n')

    // Find all BTRC-related events
    const btrcEvents = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'বিটিআরসি' } },
                { title: { contains: 'BTRC' } }
            ]
        },
        orderBy: { dateOfIncident: 'asc' }
    })

    console.log(`Found ${btrcEvents.length} BTRC-related events:\n`)

    for (const event of btrcEvents) {
        console.log(`📋 ${event.dateOfIncident?.toISOString().split('T')[0]} - ${event.title.substring(0, 60)}...`)
        console.log(`   Source: ${event.source}`)
        console.log(`   ID: ${event.id}\n`)
    }

    if (btrcEvents.length === 2) {
        const jan1Event = btrcEvents.find(e => e.dateOfIncident?.getMonth() === 0 && e.dateOfIncident?.getDate() === 1)
        const jan4Event = btrcEvents.find(e => e.dateOfIncident?.getMonth() === 0 && e.dateOfIncident?.getDate() === 4)

        if (jan1Event && jan4Event) {
            console.log(`\n🔄 Merging duplicates:`)
            console.log(`   KEEP (Jan 1): ${jan1Event.title.substring(0, 50)}...`)
            console.log(`   DELETE (Jan 4): ${jan4Event.title.substring(0, 50)}...\n`)

            // Add Jan 4 as additional source to Jan 1
            const currentSources = jan1Event.additionalSources ?
                JSON.parse(jan1Event.additionalSources) : []

            if (!currentSources.find((s: any) => s.url === jan4Event.url)) {
                currentSources.push({
                    url: jan4Event.url,
                    source: jan4Event.source,
                    title: jan4Event.title
                })

                await prisma.politicalEvent.update({
                    where: { id: jan1Event.id },
                    data: { additionalSources: JSON.stringify(currentSources) }
                })
                console.log(`   ✅ Added Jan 4 event as additional source`)
            }

            // Delete Jan 4 event
            await prisma.politicalEvent.delete({ where: { id: jan4Event.id } })
            console.log(`   ✅ Deleted Jan 4 duplicate\n`)
        }
    }

    const finalCount = await prisma.politicalEvent.count()
    console.log(`Final Event Count: ${finalCount}`)
}

mergeBTRCDuplicates()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
