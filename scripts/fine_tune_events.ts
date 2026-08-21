// @ts-nocheck
const { PrismaClient } = require('@prisma/client')
// @ts-ignore
const { analyzeWithAI } = require('../lib/ai-analysis')

const prisma = new PrismaClient()

async function main() {
    // 1. Configuration
    const BATCH_SIZE = 10
    const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT) : 100000
    const SPECIFIC_URL = process.env.URL

    console.log(`🚀 Starting Fine-Tuning Script... (Limit: ${LIMIT})`)

    // 2. Fetch Target Events
    let whereClause = {}
    if (SPECIFIC_URL) {
        whereClause = { url: SPECIFIC_URL }
    } else {
        whereClause = {}
    }

    const totalEvents = await prisma.politicalEvent.count({ where: whereClause })
    console.log(`📊 Total Events to Process: ${totalEvents}`)

    let processedCount = 0
    let updatedCount = 0
    let markedFalseCount = 0
    let skippedCount = 0
    let cursor = null

    while (processedCount < totalEvents && processedCount < LIMIT) {
        // @ts-ignore
        const events = await prisma.politicalEvent.findMany({
            where: whereClause,
            take: BATCH_SIZE,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' }
        })

        if (events.length === 0) break

        for (const event of events) {
            cursor = event.id
            processedCount++

            console.log(`\n[${processedCount}/${totalEvents}] Processing: ${event.title.substring(0, 40)}...`)

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
                console.log(`   ⚠️  No Raw Article found. Using backup text.`)
                content = event.rawText || ""
                if (content.length < 50) {
                    console.log(`   ⏭️  Content too short for AI. Skipping.`)
                    skippedCount++
                    continue
                }
            }

            try {
                const analysis = await analyzeWithAI(
                    content,
                    event.title,
                    event.url,
                    publishedAt,
                    source
                )

                if (!analysis) {
                    console.log(`   ❌ AI Analysis failed (null result).`)
                    continue
                }

                if (analysis.is_political_violence === false) {
                    console.log(`   🔻 Downgraded to non-violence.`)
                    console.log(`      Reason: ${JSON.stringify(analysis.decision_trace)}`)
                    await prisma.politicalEvent.update({
                        where: { id: event.id },
                        data: {
                            isPoliticalViolence: false,
                            tags: JSON.stringify(['AI_REJECTED'])
                        }
                    })
                    markedFalseCount++
                    continue
                }

                console.log(`   ✅ Violence Confirmed. Updating metadata...`)
                console.log(`      Score: ${event.severityScore} -> ${analysis.severity_score}`)
                console.log(`      Confidence: ${event.confidence} -> ${analysis.confidence}`)

                const updateData = {
                    title: (analysis.title && analysis.title.length > 5) ? analysis.title : event.title,
                    summary: analysis.summary,
                    dateOfIncident: analysis.incident_date ? new Date(analysis.incident_date) : event.dateOfIncident,
                    severityScore: analysis.severity_score,
                    confidence: analysis.confidence,
                    tags: JSON.stringify([analysis.incident_type]),
                    politicalParties: JSON.stringify(analysis.parties_involved || []),
                    injured: analysis.casualties?.injured || 0,
                    killed: analysis.casualties?.killed || 0,
                    locationText: analysis.location.spot || event.locationText,
                    district: analysis.location.district || event.district,
                    updatedAt: new Date()
                }

                await prisma.politicalEvent.update({
                    where: { id: event.id },
                    data: updateData
                })
                updatedCount++

            } catch (error) {
                // @ts-ignore
                const msg = error?.message || String(error)
                console.error(`   💥 Error analyzing event: ${msg}`)
            }
        }
    }

    console.log(`\n🎉 Fine-Tuning Complete!`)
    console.log(`   Processed: ${processedCount}`)
    console.log(`   Updated: ${updatedCount}`)
    console.log(`   Marked Non-Violence: ${markedFalseCount}`)
    console.log(`   Skipped: ${skippedCount}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
