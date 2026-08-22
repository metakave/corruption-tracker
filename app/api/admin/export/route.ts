import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const events = await prisma.corruptionEvent.findMany({
            orderBy: { publishedAt: 'desc' }
        })

        if (!events || events.length === 0) {
            return new NextResponse('No data found', { status: 404 })
        }

        // Define CSV Headers
        const headers = [
            'ID',
            'Title',
            'Date of Incident',
            'District',
            'Location Text',
            'Summary',
            'Sector / Ministry',
            'Amount Involved',
            'Amount Formatted',
            'Investigating Agency',
            'Legal Status',
            'Severity',
            'Confidence',
            'Source',
            'URL',
            'Category',
            'Created At'
        ].join(',')

        // Convert Data to CSV Rows
        const rows = events.map((e: any) => {
            // Helper to escape CSV fields
            const escape = (val: any) => {
                if (val === null || val === undefined) return '';
                const str = String(val).replace(/"/g, '""'); // Double quote escape
                return `"${str}"`;
            }

            return [
                escape(e.id),
                escape(e.title),
                escape(e.dateOfIncident?.toISOString().split('T')[0] || e.publishedAt?.toISOString().split('T')[0] || ''),
                escape(e.district),
                escape(e.locationText),
                escape(e.summary),
                escape(e.sectorOrMinistry),
                escape(e.amountInvolved),
                escape(e.amountFormatted),
                escape(e.investigatingAgency),
                escape(e.legalStatus),
                escape(e.severityScore),
                escape(e.confidence),
                escape(e.source),
                escape(e.url),
                escape(e.category),
                escape(e.createdAt.toISOString())
            ].join(',')
        })

        const csvContent = [headers, ...rows].join('\n')

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="corruption_data_${new Date().toISOString().split('T')[0]}.csv"`
            }
        })

    } catch (e: any) {
        return new NextResponse(`Error generating CSV: ${e instanceof Error ? e.message : String(e)}`, { status: 500 })
    }
}
