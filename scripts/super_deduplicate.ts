
import { PrismaClient, PoliticalEvent } from '@prisma/client'
import stringSimilarity from 'string-similarity'

const prisma = new PrismaClient()

// Constants
const SIMILARITY_HIGH = 0.85 // Merge regardless of other fields
const SIMILARITY_MEDIUM = 0.60 // Merge if District matches
const SIMILARITY_LOW = 0.65 // Merge if Date matches (within 3 days)

async function main() {
    console.log('--- SUPER DEDUPLICATION SCRIPT ---')

    // Fetch last 150 events (covering the "100" user mentioned + buffer)
    const events = await prisma.politicalEvent.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 150
    })

    console.log(`Loaded ${events.length} events for analysis...`)

    const processed = new Set<string>()
    let totalMerged = 0

    for (let i = 0; i < events.length; i++) {
        if (processed.has(events[i].id)) continue

        const group: PoliticalEvent[] = [events[i]]
        processed.add(events[i].id)

        for (let j = i + 1; j < events.length; j++) {
            if (processed.has(events[j].id)) continue

            const a = events[i]
            const b = events[j]

            // Calculate Similarity
            const sim = stringSimilarity.compareTwoStrings(a.title, b.title)

            let shouldMerge = false
            let reason = ''

            // 1. High Similarity (Almost identical titles)
            if (sim >= SIMILARITY_HIGH) {
                shouldMerge = true
                reason = `High Similarity (${sim.toFixed(2)})`
            }
            // 2. Medium Similarity + Same District
            else if (sim >= SIMILARITY_MEDIUM && a.district === b.district && a.district !== null) {
                shouldMerge = true
                reason = `Medium Sim (${sim.toFixed(2)}) + Same District`
            }
            // 3. Date Proximity (within 3 days) + Decent Similarity
            else if (sim >= SIMILARITY_LOW) {
                const dateA = a.dateOfIncident || a.publishedAt
                const dateB = b.dateOfIncident || b.publishedAt
                const diffTime = Math.abs(dateA.getTime() - dateB.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                if (diffDays <= 3) {
                    shouldMerge = true
                    reason = `Low Sim (${sim.toFixed(2)}) + Date Proximity (${diffDays}d)`
                }
            }

            if (shouldMerge) {
                console.log(`\n🔗 MATCH FOUND:`)
                console.log(`   A: ${a.title} (${a.district})`)
                console.log(`   B: ${b.title} (${b.district})`)
                console.log(`   Reason: ${reason}`)

                group.push(b)
                processed.add(b.id)
            }
        }

        if (group.length > 1) {
            await mergeGroup(group)
            totalMerged += (group.length - 1)
        }
    }

    console.log(`\n✅ SUPER DEDUPLICATION COMPLETE`)
    console.log(`   Removed ${totalMerged} duplicates.`)
    console.log(`   Final Estimated Count: ${events.length - totalMerged}`)
}

async function mergeGroup(group: PoliticalEvent[]) {
    // 1. Pick Primary (Best Content + Newest Incident Date logic?)
    // Actually, usually we want the one with the *oldest* incident date if we want the "start" 
    // BUT often "latest" update has more info. 
    // Let's stick to: Oldest Creation Time (Stable ID) or Most Recent Incident provided?
    // Let's use: The one with the most filled fields?
    // Simple heuristic: Sort by ID to be deterministic, or Date.
    // User prefers keeping the "cleanest". Let's pick the one with a District defined.

    group.sort((a, b) => {
        // Prioritize having a district
        if (a.district && !b.district) return -1
        if (!a.district && b.district) return 1
        // Then Prioritize earliest publishedAt (Original report) or Latest?
        // Let's keep the *Earliest* published one as the "Original" record ID, 
        // to prevent IDs jumping around on UI refresh?
        return a.publishedAt.getTime() - b.publishedAt.getTime()
    })

    const primary = group[0]
    const duplicates = group.slice(1)

    console.log(`   >>> Merging ${duplicates.length} into PRIMARY: ${primary.title}`)

    // 2. Aggregate Stats (MAX logic)
    const allKilled = group.map(e => e.killed || 0)
    const allInjured = group.map(e => e.injured || 0)

    // Filter outliers? If one says 25 and others say 1...
    // We already fixed the 25. Let's trust Max for standard merges.
    const maxKilled = Math.max(...allKilled)
    const maxInjured = Math.max(...allInjured)

    // 3. Update Primary
    await prisma.politicalEvent.update({
        where: { id: primary.id },
        data: {
            killed: maxKilled,
            injured: maxInjured,
            // Merge additional sources JSON
            additionalSources: JSON.stringify({
                mergedFrom: duplicates.map(d => d.id),
                duplicates: duplicates.map(d => ({ title: d.title, url: d.url }))
            })
        }
    })

    // 4. Delete Duplicates
    await prisma.politicalEvent.deleteMany({
        where: { id: { in: duplicates.map(d => d.id) } }
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
