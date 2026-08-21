
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();
const REFINED_CSV = path.join(process.cwd(), 'political_violence_analysis_VERIFIED.csv');

const SOURCE_SEARCH_URLS: Record<string, string> = {
    "Prothom Alo": "https://www.prothomalo.com/search?q=",
    "Jugantor": "https://www.jugantor.com/search-result?q=",
    "Samakal": "https://samakal.com/search?q=",
    "Dhaka Post": "https://www.dhakapost.com/search?q=",
    "Ajker Patrika": "https://www.ajkerpatrika.com/search?q=",
    "News24BD": "https://www.news24bd.tv/search?q=",
};
const GOOGLE_SEARCH = "https://www.google.com/search?q=";

async function main() {
    console.log("🔧 Fixing Sources and URLs from CSV...");

    if (!fs.existsSync(REFINED_CSV)) {
        console.error(`❌ CSV file missing: ${REFINED_CSV}`);
        process.exit(1);
    }

    const records = parse(fs.readFileSync(REFINED_CSV, 'utf-8'), { columns: true, skip_empty_lines: true });
    console.log(`📊 Loaded ${records.length} records.`);

    let fixedCount = 0;

    for (const row of records) {
        const id = row.ID;
        if (!id) continue;

        // Find the event in DB
        const event = await prisma.politicalEvent.findUnique({ where: { id } });

        // Only fix if it exists and (source is generic OR url is missing/google/generic)
        // Actually, let's just enforce the CSV source if the DB one is "Imported from CSV"
        if (event && (event.source === "Imported from CSV" || event.url.includes("missing-url"))) {

            const correctSource = row.Source || "News"; // Fallback from CSV
            const title = row.Title || event.title;

            // Construct new URL
            let searchBase = GOOGLE_SEARCH;
            const matchedSource = Object.keys(SOURCE_SEARCH_URLS).find(k =>
                correctSource.toLowerCase().includes(k.toLowerCase())
            );

            if (matchedSource) {
                searchBase = SOURCE_SEARCH_URLS[matchedSource];
            }
            const newUrl = `${searchBase}${encodeURIComponent(title)}`;

            console.log(`Fixing ID: ${id}`);
            console.log(`   Source: ${event.source} -> ${correctSource}`);
            console.log(`   URL: ${newUrl}`);

            await prisma.politicalEvent.update({
                where: { id },
                data: {
                    source: correctSource,
                    url: newUrl
                }
            });
            fixedCount++;
        }
    }

    console.log(`\n🎉 Corrected ${fixedCount} events.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
