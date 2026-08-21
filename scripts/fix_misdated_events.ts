

require('dotenv').config()
import { PrismaClient } from '@prisma/client'
import { analyzeWithAI } from '../lib/ai-analysis'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Starting Audit of Recent Events for Date Mismatches...")

    // Get events from the last 7 days
    const recentEvents = await prisma.politicalEvent.findMany({
        where: {
            createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 7))
            },
            isPoliticalViolence: true
        },
        orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Found ${recentEvents.length} recent events to check.`)
    let fixedCount = 0
    let invalidatedCount = 0

    for (const event of recentEvents) {
        // Heuristic: Check if summary mentions a year distinct from the incident year
        const incidentDate = event.dateOfIncident ? new Date(event.dateOfIncident) : new Date(event.publishedAt);
        const incidentYear = incidentDate.getFullYear();
        const content = (event.summary || "") + " " + event.title;

        // Look for 2023, 2024, 2025
        const yearsFound = content.match(/202[3-5]|২০২[৩-৫]/g);

        // If incident year is 2026, but older years are mentioned
        if (incidentYear === 2026 && yearsFound) {
            console.log(`\n🚩 Potential Mismatch for ID ${event.id}:`);
            console.log(`   Title: ${event.title}`);
            console.log(`   Incident Date (DB): ${incidentDate.toISOString().split('T')[0]}`);
            console.log(`   Years Found in Text: ${yearsFound.join(', ')}`);

            // Re-analyze
            console.log(`   🔄 Re-analyzing with updated AI logic...`);
            const analysis = await analyzeWithAI(
                event.rawText?.slice(0, 5000) || "",
                event.title,
                event.url,
                event.publishedAt.toISOString().split('T')[0], // Use publishedAt as Ref Date
                event.source
            );

            if (!analysis) {
                console.log(`   ❌ AI Analysis failed.`);
                continue;
            }

            if (!analysis.is_political_violence) {
                console.log(`   🚫 AI decided it is NOT violence now (Score: ${analysis.severity_score || 0}). Invalidating...`);
                await prisma.politicalEvent.update({
                    where: { id: event.id },
                    data: {
                        isPoliticalViolence: false,
                        tags: JSON.stringify([...JSON.parse(event.tags || '[]'), 'Retroactive-Invalidated'])
                    }
                });
                invalidatedCount++;
            } else {
                // Check if date changed
                const newDate = analysis.incident_date ? new Date(analysis.incident_date) : incidentDate;
                if (newDate.getFullYear() < 2026) {
                    console.log(`   ✅ Correcting Date: ${incidentDate.toISOString().split('T')[0]} -> ${newDate.toISOString().split('T')[0]}`);
                    await prisma.politicalEvent.update({
                        where: { id: event.id },
                        data: {
                            dateOfIncident: newDate,
                            tags: JSON.stringify([...JSON.parse(event.tags || '[]'), 'Date-Corrected'])
                        }
                    });
                    fixedCount++;
                } else {
                    console.log(`   ok Date matches (or still 2026). Keeping.`);
                }
            }
        }
    }

    console.log(`\n🏁 Done. Invalidated: ${invalidatedCount}, Fixed Dates: ${fixedCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
