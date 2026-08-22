
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const events = await prisma.corruptionEvent.findMany({
            orderBy: { publishedAt: 'desc' },
        })

        const csvRows = [
            ['ID', 'Title', 'Date', 'Location', 'Sector / Ministry', 'Amount Involved', 'Summary', 'URL', 'Severity', 'Category'],
        ]

        for (const event of events) {
            // Escape quotes in strings
            const escape = (text: string | null) => {
                if (!text) return ''
                return `"${text.replace(/"/g, '""')}"`
            }

            csvRows.push([
                event.id,
                escape(event.title),
                (event.dateOfIncident || event.publishedAt).toISOString().split('T')[0],
                escape(event.locationText || event.district),
                escape(event.sectorOrMinistry),
                event.amountFormatted || (event.amountInvolved ? `BDT ${event.amountInvolved}` : ''),
                escape(event.summary),
                escape(event.url),
                event.severityScore?.toString() || '1',
                escape(event.category)
            ])
        }

        const csvContent = csvRows.map(row => row.join(',')).join('\n')

        // Add BOM for Excel compatibility
        const bom = '\uFEFF'
        const finalCsv = bom + csvContent

        return new NextResponse(finalCsv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="corruption_data.csv"',
            },
        })
    } catch (error) {
        console.error('Export error:', error)
        return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 })
    }
}
