
import { ReportService } from '@/lib/services/ReportService'
import * as fs from 'fs'
import path from 'path'

async function main() {
    const service = new ReportService()

    // Date Range: Jan 1, 2026 to Jan 31, 2026
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-31T23:59:59.999Z')

    console.log("🚀 Starting January 2026 Violence Report Generation...")

    // 1. Fetch Data
    const rawEvents = await service.fetchEvents(startDate, endDate)
    console.log(`📥 Fetched ${rawEvents.length} raw events.`)

    const processedEvents: any[] = []
    let processedCount = 0

    // 2. Process Events
    // Use concurrency limit for AI/Link checks
    const BATCH_SIZE = 20

    for (let i = 0; i < rawEvents.length; i += BATCH_SIZE) {
        const batch = rawEvents.slice(i, i + BATCH_SIZE)
        console.log(`⚙️ Processing batch ${Math.ceil((i + 1) / BATCH_SIZE)}/${Math.ceil(rawEvents.length / BATCH_SIZE)}...`)

        const results = await Promise.all(batch.map(async (event) => {
            // A. Filter Summaries (like MSF report)
            if (service.isSummaryReport(event.title, event.summary || '')) {
                console.log(`   ⏭️ Skipping Summary Report: ${event.title.substring(0, 30)}...`)
                return null
            }

            // B. Categorize
            const category = await service.categorizeEvent(event)

            // C. Deep Verification (Content Cross-Check)
            // Fetch Article Text
            let verificationStatus = "Verified"
            let discrepancyNote = "None"

            try {
                const articleText = await service.fetchArticleText(event.url)
                if (articleText) {
                    const aiCheck = await service.verifyContentWithAI(event, articleText)
                    if (!aiCheck.isAccurate) {
                        verificationStatus = "Mismatch"
                        discrepancyNote = aiCheck.discrepancy || "Content mismatch detected by AI"
                        console.log(`   ❌ Discrepancy: ${discrepancyNote}`)
                    }
                } else {
                    verificationStatus = "Unreachable"
                    discrepancyNote = "Could not fetch content"
                }
            } catch (e) {
                verificationStatus = "Error"
                discrepancyNote = "Verification process failed"
            }

            return {
                id: event.id,
                date: event.dateOfIncident.toISOString().split('T')[0],
                title: event.title,
                url: event.url,
                summary: event.summary || '',
                district: event.district || 'Unknown',
                killed: event.killed || 0,
                injured: event.injured || 0,
                severity: event.severityScore || 0,
                category,
                verified: verificationStatus === "Verified", // Valid link AND Content Match
                verificationStatus,
                discrepancyNote
            }
        }))

        // Filter nulls and add to list
        results.forEach(r => {
            if (r) processedEvents.push(r)
        })

        // Safety delay to respect rate limits
        await new Promise(r => setTimeout(r, 1000))
    }

    console.log(`✅ Processing Complete. valid events: ${processedEvents.length}`)

    // 3. Generate CSV
    const csvContent = service.toCSV(processedEvents)
    const outputPath = path.join(process.cwd(), 'january_2026_report.csv')
    fs.writeFileSync(outputPath, csvContent)
    console.log(`📂 CSV Saved to: ${outputPath}`)

    // 4. Generate Verification Log CSV
    const verificationHeader = ['ID', 'URL', 'Status', 'Discrepancy']
    const verificationRows = processedEvents.map(e => [
        e.id,
        e.url,
        e.verificationStatus,
        `"${(e.discrepancyNote || '').replace(/"/g, '""')}"`
    ])
    const verificationCsv = [verificationHeader.join(','), ...verificationRows.map(r => r.join(','))].join('\n')
    const logPath = path.join(process.cwd(), 'january_2026_verification_log.csv')
    fs.writeFileSync(logPath, verificationCsv)
    console.log(`📂 Verification Log Saved to: ${logPath}`)

    // 4. Generate Markdown Summary
    const summaryPath = path.join(process.cwd(), 'january_2026_summary.md')
    const totalKilled = processedEvents.reduce((sum, e) => sum + e.killed, 0)
    const totalInjured = processedEvents.reduce((sum, e) => sum + e.injured, 0)

    const categoryCounts: Record<string, number> = {}
    processedEvents.forEach(e => {
        categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1
    })

    const mdContent = `
# January 2026 Political Violence Report
**Period:** Jan 1 - Jan 31, 2026
**Generated:** ${new Date().toISOString()}

## Overview
- **Total Incidents:** ${processedEvents.length}
- **Total Killed:** ${totalKilled}
- **Total Injured:** ${totalInjured}

## Categorization
${Object.entries(categoryCounts).map(([k, v]) => `- **${k}**: ${v}`).join('\n')}

## Dataset
See attached \`january_2026_report.csv\` for full details.
    `
    fs.writeFileSync(summaryPath, mdContent.trim())
    console.log(`📝 Summary Saved to: ${summaryPath}`)
}

main().catch(console.error)
