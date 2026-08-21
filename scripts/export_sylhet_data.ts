import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportSylhetData() {
    console.log('--- SYLHET DIVISION DATA EXPORT (Up to March 4, 2026) ---');

    const districts = ['Habiganj', 'Sylhet', 'Moulvibazar', 'Sunamganj'];
    const endDate = new Date('2026-03-04T23:59:59Z');

    const events = await prisma.politicalEvent.findMany({
        where: {
            district: { in: districts },
            publishedAt: { lte: endDate }
        },
        orderBy: {
            title: 'asc'
        }
    });

    console.log(`Found ${events.length} events for districts: ${districts.join(', ')}`);

    if (events.length === 0) {
        console.log('No events found.');
        return;
    }

    const headers = [
        'ID',
        'Title',
        'Date',
        'Source',
        'District',
        'Killed',
        'Injured',
        'Political Parties',
        'Summary',
        'URL'
    ];

    const escapeCsv = (val: any) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvLines = [headers.join(',')];

    events.forEach(event => {
        const line = [
            event.id,
            event.title,
            event.publishedAt.toISOString().split('T')[0],
            event.source,
            event.district,
            event.killed || 0,
            event.injured || 0,
            event.politicalParties || '',
            event.summary || '',
            event.url
        ].map(escapeCsv).join(',');
        csvLines.push(line);
    });

    const csvContent = csvLines.join('\n');
    const fileName = 'sylhet_division_data_2026_03_04.csv';
    const filePath = path.join(process.cwd(), fileName);

    fs.writeFileSync(filePath, csvContent);

    console.log(`\n✅ Data exported successfully to: ${filePath}`);
    console.log(`Total Records: ${events.length}`);
}

exportSylhetData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
