
import { PrismaClient } from '@prisma/client'
import { analyzeWithAI, AIAnalysisResult } from '../lib/ai-analysis'

const prisma = new PrismaClient()

async function main() {
    console.log("🚀 Starting Targeted Re-analysis...")

    // Find events where publishedAt is 2026 but dateOfIncident is < 2025
    // AND source is NOT "Unknown" (optional filter)
    const start2026 = new Date('2026-01-01')
    const start2025 = new Date('2025-01-01')

    const events = await prisma.politicalEvent.findMany({
        where: {
            publishedAt: {
                gte: start2026
            },
            OR: [
                { summary: { contains: "২০২৪" } },
                { summary: { contains: "২০২৩" } },
                { summary: { contains: "2024" } },
                { summary: { contains: "2023" } }
            ]
        },
        take: 50
    })

    console.log(`📊 Found ${events.length} suspicious events.`)

    for (const event of events) {
        console.log(`\n🔹 Processing: ${event.id} - ${event.title}`)
        console.log(`   Old Date: ${event.dateOfIncident?.toISOString().split('T')[0]}`)
        console.log(`   Published: ${event.publishedAt.toISOString().split('T')[0]}`)

        if (!event.rawText) {
            console.log("   ❌ No rawText, skipping.")
            continue
        }

        // Re-analyze with new AI logic
        // Signature: analyzeWithAI(articleText, title, url, publishedAt, sourceName)
        const analysis = await analyzeWithAI(
            event.rawText,
            event.title,           // Title was missing as 2nd arg
            event.url,
            event.publishedAt.toISOString().split('T')[0],
            event.source           // Source is 5th arg
        )

        if (analysis && analysis.incident_date) {
            console.log(`   ✅ New Analysis Result:`)
            console.log(`      Derived Date: ${analysis.incident_date}`)
            console.log(`      Summary: ${analysis.summary}`)

            // Validate the returned date
            let newDate = new Date(analysis.incident_date)
            // If AI still returns old date, Force it to Published Date
            if (newDate.getFullYear() < 2025) {
                console.log(`      ⚠️ AI returned old date (${newDate.getFullYear()}). Forcing to Published Date.`)
                newDate = event.publishedAt
                // Also attempt to fix summary year if present? 
                // Simple regex fix for summary not robust, rely on prompt first.
            }

            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    dateOfIncident: newDate,
                    summary: analysis.summary || event.summary,
                    title: analysis.title || event.title,
                    locationText: analysis.location?.spot || event.locationText,
                    district: analysis.location?.district || event.district,
                }
            })
            console.log("   ✅ Database Updated.")
        } else {
            console.log("   ❌ AI Analysis failed.")
        }
    }

    console.log("\n✅ Re-analysis Batch Complete.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
