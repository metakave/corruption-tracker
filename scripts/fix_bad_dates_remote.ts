
import { PrismaClient } from '@prisma/client'
// import { parseDateFromText } from '../lib/event-processor' 
// Note: On remote server, imports might be tricky if build step is involved. 
// But using 'npx tsx' should respect TS paths.
// To be safe, I will include the critical heuristic logic INLINE so it doesn't depend on lib exports if they differ remotely.
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking for incorrect dates in DB (Production Fix)...")

    const now = new Date()
    // Tighter Buffer: 1 hour in the future (Timezone safety)
    const futureThreshold = new Date(now.getTime() + (1 * 60 * 60 * 1000))

    console.log(`Checking for dates > ${futureThreshold.toISOString()}...`)

    // 1. Find Future Events in PoliticalEvent (Check BOTH dateOfIncident and publishedAt)
    const futureEvents = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { dateOfIncident: { gt: futureThreshold } },
                { publishedAt: { gt: futureThreshold } }
            ]
        }
    })

    console.log(`Found ${futureEvents.length} events STRICTLY in the future.`)

    for (const event of futureEvents) {
        // if (!event.dateOfIncident) continue;

        console.log(`\nFixing Future Event: "${event.title.substring(0, 50)}..."`)
        console.log(`   ID: ${event.id}`)
        console.log(`   DateOfIncident: ${event.dateOfIncident?.toISOString()}`)
        console.log(`   PublishedAt: ${event.publishedAt.toISOString()}`)

        let newDate: Date | null = null;

        // Check RawNewsArticle for this URL
        const rawArticle = await prisma.rawNewsArticle.findUnique({
            where: { url: event.url }
        })

        if (rawArticle) {
            // Check if RawNewsArticle also has a bad date (Future)
            if (rawArticle.publishedAt > futureThreshold) {
                const correctedRawDate = new Date(rawArticle.publishedAt);
                correctedRawDate.setFullYear(correctedRawDate.getFullYear() - 1);

                await prisma.rawNewsArticle.update({
                    where: { id: rawArticle.id },
                    data: { publishedAt: correctedRawDate }
                })
                console.log(`   ✅ Corrected RawArticle Date (-1 year): ${correctedRawDate.toISOString()}`)
                newDate = correctedRawDate;
            } else {
                console.log(`   ✅ Using RawArticle valid date: ${rawArticle.publishedAt.toISOString()}`)
                newDate = rawArticle.publishedAt;
            }
        }

        // Heuristic fallback
        if (!newDate) {
            // Use dateOfIncident or publishedAt (whichever is future) as base
            const baseDate = (event.dateOfIncident && event.dateOfIncident > futureThreshold)
                ? event.dateOfIncident
                : event.publishedAt;

            const fixedDate = new Date(baseDate);
            fixedDate.setFullYear(fixedDate.getFullYear() - 1);
            newDate = fixedDate;
            console.log(`   ⚠️ Using Heuristic (-1 year): ${newDate.toISOString()}`)
        }

        if (newDate) {
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    dateOfIncident: newDate,
                    publishedAt: newDate
                }
            })
            console.log(`   🎉 Fixed Event Date.`)
        }
    }

    // 2. Scan RECENT events (Jan-Feb 2026) for "2024" or "2025" text mismatches
    // This handles the "Right Day, Wrong Year" issue (e.g., 7 Jan 2026 -> 7 Jan 2024)
    console.log("\n🔍 Scanning 2026 events for year mismatches (text says 2024/2025)...")
    const recentEvents = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: new Date('2026-01-01T00:00:00Z'),
                lte: futureThreshold // Scan "valid" 2026 dates (up to Now)
            }
        }
    })

    console.log(`Found ${recentEvents.length} events in 2026 to scan.`)

    for (const event of recentEvents) {
        const textToCheck = (event.title + " " + (event.summary || "") + " " + (event.rawText || "")).toLowerCase();

        let foundYear = null;
        if (textToCheck.includes('2024') || textToCheck.includes('২০২৪')) foundYear = 2024;
        else if (textToCheck.includes('2025') || textToCheck.includes('২০২৫')) foundYear = 2025;

        if (foundYear && event.dateOfIncident && event.dateOfIncident.getFullYear() === 2026) {
            console.log(`\n⚠️ Mismatch Found: "${event.title.substring(0, 50)}..."`)
            console.log(`   Current Date: ${event.dateOfIncident.toISOString()}`)
            console.log(`   Found Year in Text: ${foundYear}`)

            // Keep the same Month/Day, just change Year
            const newDate = new Date(event.dateOfIncident);
            newDate.setFullYear(foundYear);

            console.log(`   -> Fixing Year: ${newDate.toISOString()}`)

            // Update BOTH dateOfIncident and publishedAt to keep consistent
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    dateOfIncident: newDate,
                    publishedAt: newDate
                }
            })
            console.log(`   ✅ Fixed.`)
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
