
import { PrismaClient, PoliticalEvent } from '@prisma/client'
import stringSimilarity from 'string-similarity'

const prisma = new PrismaClient()

// Constants
const SIMILARITY_THRESHOLD = 0.70 // Slightly looser for today's events

async function main() {
    console.log('--- FORCE FIX & MERGE SCRIPT ---')

    // 1. Force Fix "5 Killed" Event
    console.log('\n🔧 FIXING "5 KILLED" EVENT...')
    const targetId = '695e3207-6b4d-4e9e-99f6-1e9052d3a3d5'
    try {
        const target = await prisma.politicalEvent.findUnique({ where: { id: targetId } })
        if (target) {
            console.log(`   Found event: ${target.title}`)
            console.log(`   Current Killed: ${target.killed}`)
            if (target.killed > 1) {
                await prisma.politicalEvent.update({
                    where: { id: targetId },
                    data: { killed: 1 }
                })
                console.log(`   ✅ Fixed to Killed: 1`)
            } else {
                console.log(`   ✅ Already correct (Killed: 1)`)
            }
        } else {
            console.log(`   ⚠️ Target event not found (might have been merged/deleted already?)`)
        }
    } catch (e) {
        console.error('   ❌ Error fixing specific event:', e)
    }

    // 2. Aggressive Merge for "Today's" Events
    console.log('\n🔗 MERGING TODAYS DUPLICATES (IGNORING INCIDENT DATE)...')

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const events = await prisma.politicalEvent.findMany({
        where: { publishedAt: { gte: startOfToday } },
        orderBy: { dateOfIncident: 'desc' } // Newer incident dates preferred as primary
    })

    console.log(`   Processing ${events.length} events from today...`)

    const processed = new Set<string>()
    let mergedCount = 0

    for (let i = 0; i < events.length; i++) {
        if (processed.has(events[i].id)) continue

        const group: PoliticalEvent[] = [events[i]]
        processed.add(events[i].id)

        for (let j = i + 1; j < events.length; j++) {
            if (processed.has(events[j].id)) continue

            // 1. Check District Match (Essential)
            if (events[i].district !== events[j].district) continue

            // 2. Check Title Similarity
            const sim = stringSimilarity.compareTwoStrings(events[i].title, events[j].title)

            if (sim >= SIMILARITY_THRESHOLD) {
                console.log(`   🔗 MATCH FOUND (${sim.toFixed(2)}):`)
                console.log(`      A: ${events[i].title}`)
                console.log(`      B: ${events[j].title}`)

                group.push(events[j])
                processed.add(events[j].id)
            }
        }

        if (group.length > 1) {
            // MERGE EXECUTION
            // Prioritize the one with the most recent Date of Incident (likely 2026, not 2024)
            // If equal, take the one with more content/fields

            group.sort((a, b) => {
                const dateA = a.dateOfIncident ? a.dateOfIncident.getTime() : 0
                const dateB = b.dateOfIncident ? b.dateOfIncident.getTime() : 0
                return dateB - dateA // Descending
            })

            const primary = group[0]
            const duplicates = group.slice(1)

            console.log(`      >>> Merging ${duplicates.length} into PRIMARY: ${primary.title} (${primary.dateOfIncident?.toISOString()})`)

            // 1. Delete Duplicates
            await prisma.politicalEvent.deleteMany({
                where: { id: { in: duplicates.map(d => d.id) } }
            })

            // 2. Update Primary (Combine sources)
            // (Simplified source merging for this quick fix - mainly appending IDs to internal list if needed, 
            // but for stats, just keeping the valid primary is 90% of the win)

            // Only thing to ensure is casualty MAX logic again just in case
            const maxKilled = Math.max(...group.map(e => e.killed || 0))
            const maxInjured = Math.max(...group.map(e => e.injured || 0))

            if (primary.killed !== maxKilled || primary.injured !== maxInjured) {
                await prisma.politicalEvent.update({
                    where: { id: primary.id },
                    data: { killed: maxKilled, injured: maxInjured }
                })
                console.log(`      Updated Primary stats: K${maxKilled}/I${maxInjured}`)
            }

            mergedCount += duplicates.length
        }
    }

    console.log(`\n✅ Merged/Deleted ${mergedCount} duplicate events from today's list.`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
