
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const events = await prisma.politicalEvent.findMany({
            orderBy: { publishedAt: 'desc' },
        })

        const csvRows = [
            ['ID', 'Title', 'Date', 'Location', 'Killed', 'Injured', 'Summary', 'URL', 'Severity', 'Parties'],
        ]

        for (const event of events) {
            // Escape quotes in strings
            const escape = (text: string | null) => {
                if (!text) return ''
                return `"${text.replace(/"/g, '""')}"`
            }

            const parties = event.politicalParties ? JSON.parse(event.politicalParties).join(', ') : ''

            csvRows.push([
                event.id,
                escape(event.title),
                event.publishedAt.toISOString().split('T')[0],
                escape(event.locationText || event.district),
                event.killed?.toString() || '0',
                event.injured?.toString() || '0',
                escape(event.summary),
                escape(event.url),
                event.severityScore?.toString() || '1',
                escape(parties)
            ])
        }

        const csvContent = csvRows.map(row => row.join(',')).join('\n')

        // Add BOM for Excel compatibility
        const bom = '\uFEFF'
        const finalCsv = bom + csvContent

        return new NextResponse(finalCsv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="political_violence_data.csv"',
            },
        })
    } catch (error) {
        console.error('Export error:', error)
        return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 })
    }
}
