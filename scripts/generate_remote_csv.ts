
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Generating CSV...");
    const events = await prisma.politicalEvent.findMany({
        orderBy: { dateOfIncident: 'desc' }
    });

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
        'Source',
        'Political Parties',
        'Incident Type',
        'Victim Parties',
        'Perpetrator Parties'
    ].join(',');

    const rows = events.map(e => {
        const escape = (val: any) => {
            if (val === null || val === undefined) return '';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };

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
            escape(e.source),
            escape(e.politicalParties),
            escape(JSON.parse(e.tags || '[]')[0] || ''),
            escape(e.victimParties),
            escape(e.perpetratorParties)
        ].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    fs.writeFileSync('political_violence_analysis.csv', csvContent);
    console.log("CSV Generated: political_violence_analysis.csv");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
