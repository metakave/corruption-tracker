
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Files - use relative paths that work on server
const REFINED_CSV = path.join(process.cwd(), 'political_violence_analysis_AI_REFINED.csv');

async function main() {
    console.log("🚀 Starting Smart Database Sync...");

    if (!fs.existsSync(REFINED_CSV)) {
        console.error(`❌ CSV file missing: ${REFINED_CSV}`);
        process.exit(1);
    }

    // Load CSV
    const refinedRecords = parse(fs.readFileSync(REFINED_CSV, 'utf-8'), { columns: true, skip_empty_lines: true });

    console.log(`📊 Loaded ${refinedRecords.length} refined events.`);

    let updatedCount = 0;
    let notFound = 0;

    for (const aiRow of refinedRecords) {
        const id = aiRow.ID;

        // Fetch Live DB Record
        const dbRecord = await prisma.politicalEvent.findUnique({ where: { id } });

        if (!dbRecord) {
            notFound++;
            continue;
        }

        // -------------------------------------------------------------
        // SMART MERGE LOGIC
        // -------------------------------------------------------------
        const updates: any = {};

        // 1. Always Update AI Categorization fields
        if (aiRow['Incident Type'] && aiRow['Incident Type'] !== 'Other' && aiRow['Incident Type'] !== '') {
            updates.category = aiRow['Incident Type'];
            updates.isPoliticalViolence = aiRow['Incident Type'] === 'Political Violence' || aiRow['Incident Type'] === 'Terrorism / Extremist Attacks';
        }

        if (aiRow['Tags']) {
            updates.tags = aiRow['Tags'];
        }

        if (aiRow['AI_Confidence']) {
            updates.confidence = parseFloat(aiRow['AI_Confidence']) || 0;
        }

        // 2. Update District, Killed, Injured from AI if they differ
        const aiDistrict = aiRow.District?.trim();
        if (aiDistrict && aiDistrict !== dbRecord.district) {
            updates.district = aiDistrict;
        }

        const aiKilled = parseInt(aiRow.Killed) || 0;
        if (aiKilled !== (dbRecord.killed || 0)) {
            updates.killed = aiKilled;
        }

        const aiInjured = parseInt(aiRow.Injured) || 0;
        if (aiInjured !== (dbRecord.injured || 0)) {
            updates.injured = aiInjured;
        }

        // Apply Updates
        if (Object.keys(updates).length > 0) {
            await prisma.politicalEvent.update({
                where: { id },
                data: updates
            });
            updatedCount++;
            if (updatedCount % 50 === 0) {
                console.log(`   ... processed ${updatedCount} events`);
            }
        }
    }

    console.log(`\n🎉 Sync Complete!`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⏩ Not found in DB: ${notFound}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
