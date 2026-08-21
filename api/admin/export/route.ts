import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const events = await prisma.politicalEvent.findMany({
            orderBy: { dateOfIncident: 'desc' }
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
            'Killed',
            'Injured',
            'Severity',
            'Confidence',
            'Source',
            'URL',
            'Political Parties',
            'Incident Type',
            'Created At'
        ].join(',')

        // Convert Data to CSV Rows
        const rows = events.map(e => {
            // Helper to escape CSV fields
            const escape = (val: any) => {
                if (val === null || val === undefined) return '';
                const str = String(val).replace(/"/g, '""'); // Double quote escape
                return `"${str}"`;
            }

            return [
                escape(e.id),
                escape(e.title),
                escape(e.dateOfIncident?.toISOString().split('T')[0] || ''),
                escape(e.district),
                escape(e.locationText),
                escape(e.summary),
                escape(e.killed),
                escape(e.injured),
                escape(e.severityScore),
                escape(e.confidence),
                escape(e.source),
                escape(e.url),
                escape(e.politicalParties), // It's a JSON string, keeping as is or parsing? Keeping as raw string is safer for CSV
                escape(JSON.parse(e.tags || '[]')[0] || ''), // Incident Type (usually 1st tag)
                escape(e.createdAt.toISOString())
            ].join(',')
        })

        const csvContent = [headers, ...rows].join('\n')

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="political_violence_data_${new Date().toISOString().split('T')[0]}.csv"`
            }
        })

    } catch (e) {
        return new NextResponse(`Error generating CSV: ${e instanceof Error ? e.message : String(e)}`, { status: 500 })
    }
}
