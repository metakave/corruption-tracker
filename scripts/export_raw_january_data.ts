
import { prisma } from '@/lib/db'
import * as fs from 'fs'
import path from 'path'
import { toBDDateStart, toBDDateEnd } from '@/lib/utils'

async function main() {
    console.log("🚀 Starting Raw Data Export for January 2026...")

    // Use BD Timezone logic to ensure we cover the correct 24h periods
    const startDate = toBDDateStart(new Date('2026-01-01T00:00:00Z'))
    const endDate = toBDDateEnd(new Date('2026-01-31T23:59:59Z'))

    console.log(`📅 Date Range: ${startDate.toISOString()} - ${endDate.toISOString()}`)

    // Fetch EVERYTHING (no filters other than date)
    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                {
                    dateOfIncident: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                {
                    dateOfIncident: null,
                    publishedAt: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            ]
        },
        orderBy: {
            dateOfIncident: 'asc'
        }
    })

    console.log(`📥 Fetched ${events.length} TOTAL events.`)

    // Convert to CSV
    const header = ['ID', 'Date', 'Title', 'URL', 'District', 'Summary', 'Killed', 'Injured', 'IsPoliticalViolence']
    const rows = events.map(e => [
        e.id,
        (e.dateOfIncident || e.publishedAt || new Date()).toISOString().split('T')[0],
        `"${e.title.replace(/"/g, '""')}"`,
        e.url,
        e.district || 'Unknown',
        `"${(e.summary || '').replace(/"/g, '""')}"`,
        e.killed,
        e.injured,
        e.isPoliticalViolence ? 'Yes' : 'No'
    ])

    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
    const outputPath = path.join(process.cwd(), 'january_2026_raw_dataset.csv')
    fs.writeFileSync(outputPath, csvContent)

    console.log(`📂 Raw Dataset Saved to: ${outputPath}`)
}

main().catch(console.error)
