import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

// String similarity helper (from event-processor)
function getSimilarity(str1: string, str2: string): number {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) { track[0][i] = i; }
    for (let j = 0; j <= str2.length; j += 1) { track[j][0] = j; }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator,
            );
        }
    }
    const distance = track[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
}

// Word overlap helper
function getWordOverlap(str1: string, str2: string): number {
    const set1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const set2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    if (set1.size === 0 || set2.size === 0) return 0;
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}

async function mergeDuplicates() {
    console.log('🔍 Finding duplicate events (7-day window)...\n')

    // Fetch all events
    const allEvents = await prisma.politicalEvent.findMany({
        orderBy: { dateOfIncident: 'desc' }
    })

    console.log(`📊 Total events: ${allEvents.length}\n`)

    let mergedCount = 0
    let deletedCount = 0

    // Compare all events - no grouping (use 7-day rolling window)
    for (let i = 0; i < allEvents.length; i++) {
        const event1 = allEvents[i]

        // Skip if already deleted
        const check = await prisma.politicalEvent.findUnique({ where: { id: event1.id } })
        if (!check) continue

        if (!event1.dateOfIncident || !event1.district) continue

        const event1Date = event1.dateOfIncident.getTime()
        const sevenDays = 7 * 24 * 60 * 60 * 1000

        for (let j = i + 1; j < allEvents.length; j++) {
            const event2 = allEvents[j]

            // Skip if already deleted
            const check2 = await prisma.politicalEvent.findUnique({ where: { id: event2.id } })
            if (!check2) continue

            // Only compare same district
            if (!event2.dateOfIncident || event2.district !== event1.district) continue

            // Only compare if within 7 days
            const event2Date = event2.dateOfIncident.getTime()
            const timeDiff = Math.abs(event1Date - event2Date)
            if (timeDiff > sevenDays) continue

            // Calculate similarities
            const titleSim = getSimilarity(event1.title, event2.title)
            const summarySim = event1.summary && event2.summary ?
                getWordOverlap(event1.summary, event2.summary) : 0

            // Title word overlap
            const title1Words = event1.title.split(/\s+/).filter(w => w.length > 3)
            const title2Words = event2.title.split(/\s+/).filter(w => w.length > 3)
            const commonWords = title1Words.filter(w => title2Words.includes(w))
            const significantTitleOverlap = commonWords.length >= 2

            // NEW: Location-specific keyword matching
            const locationKeywords = ['btrc', 'বিটিআরসি', 'আগারগাঁও', 'কারওয়ান']
            let hasSpecificLocation = false
            for (const keyword of locationKeywords) {
                if (event1.title.toLowerCase().includes(keyword) &&
                    event2.title.toLowerCase().includes(keyword)) {
                    hasSpecificLocation = true
                    break
                }
            }

            // Party overlap
            let partyOverlap = 0
            try {
                const parties1 = event1.politicalParties ?
                    JSON.parse(event1.politicalParties).map((p: string) => p.toLowerCase()) : []
                const parties2 = event2.politicalParties ?
                    JSON.parse(event2.politicalParties).map((p: string) => p.toLowerCase()) : []

                if (parties1.length > 0 && parties2.length > 0) {
                    const commonParties = parties1.filter((p: string) => parties2.includes(p))
                    partyOverlap = commonParties.length / Math.max(parties1.length, parties2.length)
                }
            } catch (e) { }

            // Same source check
            const isSameSource = event1.source === event2.source

            // NEW: Extract person names (Bengali names pattern: 2-4 word sequences)
            const extractNames = (text: string): string[] => {
                // Common Bengali name patterns
                const namePattern = /([অ-ৰ]+(?:\s+[অ-ৰ]+){1,3})/g
                const matches = text.match(namePattern) || []
                return matches.filter(m => m.length > 5 && m.length < 30)
            }

            const names1 = extractNames(event1.title)
            const names2 = extractNames(event2.title)
            let hasCommonName = false
            for (const name1 of names1) {
                for (const name2 of names2) {
                    if (getSimilarity(name1, name2) > 0.7) {
                        hasCommonName = true
                        break
                    }
                }
                if (hasCommonName) break
            }

            // NEW: Casualty matching
            const casualtyMatch = (
                event1.killed === event2.killed && event1.killed > 0
            ) || (
                    event1.injured === event2.injured && event1.injured > 2
                )

            // Enhanced merge logic
            const shouldMerge = (
                titleSim > 0.45 ||
                (significantTitleOverlap && (summarySim > 0.2 || titleSim > 0.3)) ||
                summarySim > 0.4 ||
                (isSameSource && partyOverlap > 0.5) ||
                partyOverlap > 0.6 ||
                (hasSpecificLocation && partyOverlap > 0.3) ||
                hasCommonName || // NEW: Person name match
                (casualtyMatch && partyOverlap > 0.5) // NEW: Casualty + actor match
            )

            if (shouldMerge) {
                const daysDiff = Math.round(timeDiff / (24 * 60 * 60 * 1000))
                console.log(`🔄 MERGING (${daysDiff}d apart):`)
                console.log(`   [1] ${event1.dateOfIncident.toISOString().split('T')[0]} - ${event1.title.substring(0, 50)}...`)
                console.log(`   [2] ${event2.dateOfIncident.toISOString().split('T')[0]} - ${event2.title.substring(0, 50)}...`)
                console.log(`   Metrics: Title=${titleSim.toFixed(2)}, Summary=${summarySim.toFixed(2)}, Party=${partyOverlap.toFixed(2)}`)
                console.log(`   Signals: SpecificLoc=${hasSpecificLocation}, CommonName=${hasCommonName}, CasualtyMatch=${casualtyMatch}`)

                // Merge
                const currentSources = event1.additionalSources ?
                    JSON.parse(event1.additionalSources) : []

                const exists = currentSources.find((s: any) =>
                    s.url === event2.url || s.source === event2.source
                )

                if (!exists && event2.url !== event1.url) {
                    currentSources.push({
                        url: event2.url,
                        source: event2.source,
                        title: event2.title
                    })

                    // Merge event2's additional sources
                    if (event2.additionalSources) {
                        const event2Sources = JSON.parse(event2.additionalSources)
                        for (const src of event2Sources) {
                            if (!currentSources.find((s: any) => s.url === src.url)) {
                                currentSources.push(src)
                            }
                        }
                    }

                    await prisma.politicalEvent.update({
                        where: { id: event1.id },
                        data: { additionalSources: JSON.stringify(currentSources) }
                    })
                }

                // Delete event2
                await prisma.politicalEvent.delete({ where: { id: event2.id } })

                mergedCount++
                deletedCount++
                console.log(`   ✅ Merged and deleted\n`)
            }
        }
    }

    console.log(`\n🏁 Cleanup Complete!`)
    console.log(`   Total Merges: ${mergedCount}`)
    console.log(`   Events Deleted: ${deletedCount}`)

    const finalCount = await prisma.politicalEvent.count()
    console.log(`   Final Event Count: ${finalCount}`)
}

mergeDuplicates()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
