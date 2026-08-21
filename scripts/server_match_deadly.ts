
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Read Report
    const report = fs.readFileSync('Brief_Description_January_2026_Violence_Report_Bangla.md', 'utf-8');

    // 2. Read JSON
    const deadlyEvents = JSON.parse(fs.readFileSync('jan_deadly.json', 'utf-8'));

    console.log(`Checking ${deadlyEvents.length} deadly events...`);

    const toDelete = [];

    for (const event of deadlyEvents) {
        // Simple heuristic: Is a significant part of the title in the report?
        // We split into words and check if > 50% of words (length > 4 chars) match any line
        // Or specific unique keyword match

        // Let's normalize for better matching
        const reportNorm = report.replace(/[^\u0980-\u09FFa-zA-Z0-9]/g, ' ');
        const titleNorm = event.title.replace(/[^\u0980-\u09FFa-zA-Z0-9]/g, ' ');

        // Exact substring match first (robust for specific phrases)
        // Check if at least one unique 3-word sequence exists?

        // Let's rely on specific keywords for the ones we suspect 
        // Or simply check if the title string (ignoring spaces) is loosely found

        // Simpler: Check if distinct title words appear in report
        // If "NOT FOUND", add to delete list.

        // Actually, let's just output the ones NOT found so I can inspect manually before deleting
        // because automated deletion on 160 items is risky.

        // But for the sake of speed, let's assume if "Distinctive Title" isn't found, it's the extra ones.
        // I'll print the "Suspects"

        // NOTE: I really just want to find the 2 extra ones.

        let found = report.includes(event.title);
        if (!found) {
            // Try looser match
            const words = event.title.split(' ').filter(w => w.length > 3);
            let matchCount = 0;
            for (const w of words) {
                if (report.includes(w)) matchCount++;
            }
            if (matchCount >= Math.min(3, words.length)) found = true;
        }

        if (!found) {
            console.log(`[SUSPECT] ID: ${event.id} | Title: ${event.title} | Kill: ${event.killed}`);
            toDelete.push(event.id);
        }
    }
}

main();
