
import { PrismaClient } from '@prisma/client'
import { checkDuplicateWithAI } from '../lib/ai-analysis'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

// Copy of helper from event-processor.ts
const extractKeywords = (text: string) => text.split(/\s+/).filter(w => w.length > 4 && !['Bangladesh', 'Dhaka'].includes(w)).slice(0, 3)

async function main() {
    console.log("Starting Retroactive Smart Deduplication...")

    // 1. Fetch all events, NEWEST FIRST
    // We want to merge New into Old, or Old into Older.
    // By going Newest first, we pick a "New" event and look for its "Older" original.
    const allEvents = await prisma.politicalEvent.findMany({
        orderBy: { dateOfIncident: 'desc' }
    })

    console.log(`Found ${allEvents.length} events to process.`)

    let mergedCount = 0

    for (const targetEvent of allEvents) {
        // Skip if already deleted (check effectively via cache or just robust error handling)
        const stillExists = await prisma.politicalEvent.findUnique({ where: { id: targetEvent.id } })
        if (!stillExists) continue

        console.log(`\nProcessing: [${targetEvent.id}] ${targetEvent.dateOfIncident?.toISOString().split('T')[0]} - ${targetEvent.title}`)

        // 2. Hybrid Search for Candidates (Older than target)
        const titleKeywords = extractKeywords(targetEvent.title)

        // Define time window for 'Recency' check relative to THIS event
        const eventDate = targetEvent.dateOfIncident || targetEvent.publishedAt
        const threeDaysAgo = new Date(eventDate)
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
        const threeDaysFuture = new Date(eventDate)
        threeDaysFuture.setDate(threeDaysFuture.getDate() + 3)

        // Find match candidates: Must be OLDER than the current event (or same day but created earlier, but id compare handles that implicitly if we merge into *others*)
        // Actually, we just look for *any* other event that could be the "Original".
        // Let's look for events that are NOT this event.
        const candidates = await prisma.politicalEvent.findMany({
            where: {
                id: { not: targetEvent.id },
                district: targetEvent.district, // Must be same district
                OR: [
                    {
                        // 1. Strict Recency (Around the same time)
                        dateOfIncident: {
                            gte: threeDaysAgo,
                            lte: threeDaysFuture
                        }
                    },
                    {
                        // 2. Text Search (Any Time) - Catch long-tail
                        OR: titleKeywords.map(k => ({
                            title: { contains: k, mode: 'insensitive' }
                        }))
                    }
                ]
            },
            take: 5,
            orderBy: { dateOfIncident: 'desc' }
        })

        if (candidates.length === 0) {
            console.log("   ⚪ No candidates found.")
            continue
        }

        // 3. Ask AI
        const candidatePayloads = candidates.map(e => ({
            id: e.id,
            title: e.title,
            summary: e.summary || '',
            date: e.dateOfIncident || e.publishedAt,
            district: e.district || ''
        }))

        // We construct a "New Article" payload from the Target Event
        const targetPayload = {
            title: targetEvent.title,
            summary: targetEvent.summary || '',
            date: targetEvent.dateOfIncident?.toISOString() || targetEvent.publishedAt.toISOString(),
            source: targetEvent.source
        }

        console.log(`   🔎 Checking against ${candidates.length} candidates...`)
        const matchId = await checkDuplicateWithAI(targetPayload, candidatePayloads)

        if (matchId) {
            console.log(`   🤖 MATCH FOUND! ID: ${matchId}`)

            // 4. Merge Logic
            // We assume the stored event 'matchId' is the one we want to keep?
            // Or does it matter? Usually keep the Older one?
            // The query returned candidates. `matchId` is one of them.
            // Let's verify it exists.
            const originalEvent = await prisma.politicalEvent.findUnique({ where: { id: matchId } })
            if (!originalEvent) continue

            // We merge Target (Newer/Duplicate) INTO Original (Older/Existing)
            console.log(`   🔄 Merging [${targetEvent.id}] INTO [${originalEvent.id}]...`)

            // Update Original's additionalSources
            let currentSources = originalEvent.additionalSources ? JSON.parse(originalEvent.additionalSources) : []
            if (!Array.isArray(currentSources)) currentSources = []

            // Add Target's source if unique
            const exists = currentSources.find((s: any) => s.url === targetEvent.url || s.source === targetEvent.source);
            if (!exists) {
                currentSources.push({
                    url: targetEvent.url,
                    source: targetEvent.source,
                    title: targetEvent.title
                })
                // Also merge any sources THE TARGET already had
                if (targetEvent.additionalSources) {
                    let targetSources: any[] = []
                    try {
                        const parsed = JSON.parse(targetEvent.additionalSources)
                        if (Array.isArray(parsed)) targetSources = parsed
                    } catch (e) { }

                    for (const ts of targetSources) {
                        const texists = currentSources.find((s: any) => s.url === ts.url);
                        if (!texists) currentSources.push(ts)
                    }
                }

                await prisma.politicalEvent.update({
                    where: { id: originalEvent.id },
                    data: { additionalSources: JSON.stringify(currentSources) }
                })
            }

            // Delete the Duplicate (Target)
            await prisma.politicalEvent.delete({ where: { id: targetEvent.id } })
            console.log(`   🗑️ Deleted duplicate event ${targetEvent.id}`)
            mergedCount++
        } else {
            console.log("   ⚪ No AI match.")
        }
    }

    console.log(`\n✅ Completed. Merged ${mergedCount} duplicates.`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
