
import { PrismaClient } from '@prisma/client'
import { analyzeWithAI } from '../lib/ai-analysis'

const prisma = new PrismaClient()

async function main() {
    console.log("🛠️ Starting Bulk Repair for Mismatched Events...")

    // 1. Fetch last 50 events to cover the 37
    const events = await prisma.politicalEvent.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Checking ${events.length} events...`)

    let fixedCount = 0
    let skippedCount = 0

    for (const event of events) {
        console.log(`\n---------------------------------------------------`)
        console.log(`Checking ID: ${event.id}`)
        console.log(`Title: ${event.title.substring(0, 40)}...`)
        console.log(`Current URL: ${event.url}`)

        // 2. heuristic: check if current URL/Content is suspicious (Sports/Entertainment)
        const isSuspicious = event.url.includes('sports') ||
            event.url.includes('entertainment') ||
            (event.rawText && (event.rawText.includes('টস') || event.rawText.includes('উইকেট')))

        if (isSuspicious) {
            console.log(`⚠️  Flagged as SUSPICIOUS URL/Content.`)
        } else {
            // Even if not strictly suspicious URL, the Title might be from a different article if it's a "sidebar" issue.
            // We should check if there is a BETTER match in RawNewsArticle table by Title.
        }

        // 3. Search RawNewsArticle by TITLE (fuzzy or exact)
        // We strip punctuation for better matching
        const cleanTitle = event.title.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")

        // We try to find a RawNewsArticle where the content contains the title or the title matches? 
        // Actually, the RawNewsArticle likely has the same title in its structure if scanned correctly?
        // No, RawNewsArticle only has url, content, publishedAt. It does NOT have a separate title field usually.
        // We have to search CONTENT for the title string, or just hope we can find it.
        // Wait, if the scraper visited the correct URL previously, it would be in RawNewsArticle.

        // Strategy: Search RawNewsArticle for content containing a significant chunk of the Title.
        // OR search if we have a RawNewsArticle with a URL that "looks like" the title slug? Hard for Bengali.

        // Let's rely on the fact that if we have a "mismatch", there exists a "correct" entry in RawNewsArticle that is ORPHANED (not linked to any Event) OR we just need to find it.

        // Search for any article containing the exact title in content (often title is first line)
        // Optimization: This might be slow if we search ALL. Limits?
        // Let's assume the correct article was scraped recently.

        const potentialMatches = await prisma.rawNewsArticle.findMany({
            where: {
                content: {
                    contains: event.title.substring(0, 20) // First 20 chars of title
                },
                scrapedAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            },
            take: 5
        })

        let bestMatch = null

        for (const match of potentialMatches) {
            // Check if this match really contains the title
            if (match.content.includes(event.title)) {
                // Check if this is DIFFERENT from current event URL
                if (match.url !== event.url) {
                    bestMatch = match
                    console.log(`✅ Found BETTER match in RawDB!`)
                    console.log(`   New URL: ${match.url}`)
                    break
                }
            }
        }

        if (bestMatch) {
            console.log(`🛠️ FIXING detected...`)

            // Update PoliticalEvent
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    url: bestMatch.url,
                    rawText: bestMatch.content // Cache it
                }
            })

            // Re-Analyze
            console.log(`   🧠 Re-analyzing with correct content...`)
            const analysis = await analyzeWithAI(
                bestMatch.content,
                event.title,
                bestMatch.url,
                bestMatch.publishedAt.toISOString(),
                event.source
            )

            if (analysis) {
                // Update Metadata
                await prisma.politicalEvent.update({
                    where: { id: event.id },
                    data: {
                        isPoliticalViolence: analysis.is_political_violence,
                        title: analysis.title,
                        summary: analysis.summary,
                        tags: JSON.stringify([analysis.incident_type]),
                        severityScore: analysis.severity_score,
                        confidence: analysis.confidence,
                        locationText: analysis.location.spot,
                        district: analysis.location.district,
                        injured: analysis.casualties.injured,
                        killed: analysis.casualties.killed,
                        updatedAt: new Date()
                    }
                })
                console.log(`   🎉 Fixed and Updated!`)
                fixedCount++
            } else {
                console.log(`   ❌ AI Analysis failed.`)
            }
        } else {
            console.log(`   ⏭️ No better match found. Skipping.`)
            skippedCount++
        }
    }

    console.log(`\n===================================================`)
    console.log(`Repair Complete.`)
    console.log(`Fixed: ${fixedCount}`)
    console.log(`Skipped/No Match: ${skippedCount}`)
    console.log(`===================================================`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
