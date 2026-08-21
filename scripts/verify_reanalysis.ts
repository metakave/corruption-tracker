
import { PrismaClient } from '@prisma/client'
import { analyzeWithAI } from '../lib/ai-analysis'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Starting Verification (Dry Run)...")

    // Fetch the latest 50 events (to cover the 37 mentioned)
    const events = await prisma.politicalEvent.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Found ${events.length} events to verify.`)

    let changedCount = 0
    let unchangedCount = 0

    for (const event of events) {
        console.log(`\n---------------------------------------------------`)
        console.log(`Checking Event ID: ${event.id}`)
        console.log(`Title: ${event.title}`)

        // Fetch Raw Article
        const rawArticle = await prisma.rawNewsArticle.findUnique({
            where: { url: event.url }
        })

        let content = ""
        let publishedAt = event.publishedAt.toISOString()
        let source = event.source

        if (rawArticle) {
            content = rawArticle.content
            publishedAt = rawArticle.publishedAt.toISOString()
        } else {
            console.log(`⚠️ No Raw Article found. using backup text.`)
            content = event.rawText || ""
        }

        if (content.length < 50) {
            console.log(`⏭️ Content too short. Skipping.`)
            continue
        }

        try {
            // Re-analyze
            const newAnalysis = await analyzeWithAI(
                content,
                event.title,
                event.url,
                publishedAt,
                source
            )

            if (!newAnalysis) {
                console.log(`❌ AI Analysis failed (null).`)
                continue
            }

            // Compare
            const oldSeverity = event.severityScore
            const newSeverity = newAnalysis.severity_score
            const oldType = JSON.parse(event.tags || '[]')[0] || 'Unknown'
            const newType = newAnalysis.incident_type

            const isViolenceNow = newAnalysis.is_political_violence

            if (!isViolenceNow) {
                console.log(`🔴 RESULT: AI now marks this as NON-VIOLENCE.`)
                console.log(`   Reason: ${JSON.stringify(newAnalysis.decision_trace)}`)
                changedCount++
            } else {
                let changes = []
                if (oldSeverity !== newSeverity) changes.push(`Severity: ${oldSeverity} -> ${newSeverity}`)
                if (oldType !== newType) changes.push(`Type: ${oldType} -> ${newType}`)

                if (changes.length > 0) {
                    console.log(`🟡 RESULT: CHANGED`)
                    changes.forEach(c => console.log(`   ${c}`))
                    changedCount++
                } else {
                    console.log(`🟢 RESULT: UNCHANGED (Consistent)`)
                    unchangedCount++
                }
            }

        } catch (error) {
            console.error(`💥 Error:`, error)
        }
    }

    console.log(`\n===================================================`)
    console.log(`SUMMARY:`)
    console.log(`Checked: ${events.length}`)
    console.log(`Changed/Different: ${changedCount}`)
    console.log(`Consistent: ${unchangedCount}`)
    console.log(`===================================================`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
