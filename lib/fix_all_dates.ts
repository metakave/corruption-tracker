
require('dotenv').config()
import { PrismaClient } from '@prisma/client'
import { analyzeWithAI } from '../lib/ai-analysis'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Starting Mass Date Correction for ALL Events...")

    // Fetch all events, oldest first just in case
    // Or maybe newest first is better to fix the "Live Feed" immediately? Yes.
    const events = await prisma.corruptionEvent.findMany({
        where: {
            isCorruption: true,
        },
        orderBy: { createdAt: 'desc' },
        // take: 200 // Process ALL events now
    })

    console.log(`📊 Processing most recent ${events.length} events...`)

    let updatedCount = 0
    let unchangedCount = 0

    for (const event of events) {
        // Skip if we don't have text
        const textToAnalyze = event.rawText || (event.summary + " " + event.title);

        if (!textToAnalyze || textToAnalyze.length < 50) {
            console.log(`   ⏭️ Skipping ID ${event.id} (No text content)`);
            continue;
        }

        console.log(`   🔄 Analyzing ID ${event.id} (${event.title.substring(0, 30)}...)...`);

        // Re-analyze
        try {
            const analysis = await analyzeWithAI(
                textToAnalyze.slice(0, 5000),
                event.title,
                event.url,
                event.publishedAt.toISOString().split('T')[0],
                event.source
            );

            if (!analysis) {
                console.log(`      ❌ AI Failed.`);
                continue;
            }

            if (analysis.incident_date) {
                const newDate = new Date(analysis.incident_date);
                const oldDate = event.dateOfIncident ? new Date(event.dateOfIncident) : null;

                // Check difference
                let needsUpdate = false;
                if (!oldDate) needsUpdate = true;
                else {
                    const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays > 0) needsUpdate = true;
                }

                if (needsUpdate) {
                    console.log(`      ✏️ UPDATING Date: ${oldDate?.toISOString().split('T')[0]} -> ${newDate.toISOString().split('T')[0]}`);

                    // Safety check: Don't set future dates
                    if (newDate > new Date()) {
                        console.log(`      ⚠️ Proposed date is in future, skipping.`);
                        continue;
                    }

                    await prisma.corruptionEvent.update({
                        where: { id: event.id },
                        data: {
                            dateOfIncident: newDate,
                            tags: JSON.stringify([...JSON.parse(event.tags || '[]'), 'Date-Refined'])
                        }
                    });
                    updatedCount++;
                } else {
                    unchangedCount++;
                    // console.log(`      ✅ Date is accurate.`);
                }
            }
        } catch (e) {
            console.error(`      ⚠️ Error: ${e}`);
        }
    }

    console.log(`\n🏁 Done. Updated: ${updatedCount}, Unchanged: ${unchangedCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
