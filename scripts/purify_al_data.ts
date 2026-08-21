
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List of IDs or patterns identified as "false positives" for Awami League involvement
// For this pass, we'll try a logic-based approach:
// If Title contains "effigy", "mockery", "protest against" AND AL is tagged, it might be noise to the user.
// BUT safest is to remove AL tag from specific "bad" events if I had the list.
// Since I can't interactively pick, I'll implement a heuristic:
// If "BNP" is present AND "Awami League" is present, allow it (conflict).
// If "Awami League" matches but title implies internal feud, allow it.
// The user says "vouge data".
// Let's look for specific non-violent or irrelevant contexts.
// Actually, looking at the logs: "Kuishputtulika daho" (Effigy burning) -> This is political violence/unrest, but maybe user thinks it's not "AL violence".
// However, if the user says "vouge", maybe they mean the "Local" substring match again?
// Wait, I fixed the "AL" substring match.
// Let's re-examine the logs from the previous step.
// ID: 3c533a43... "BNP activists protest, burn effigy of former AL MP".
// Tagged: ["BNP", "Awami League"].
// This IS relevant to AL (they are the target of the effigy burning).
// But maybe the user wants ONLY events where AL is the PERPETRATOR?
// Or maybe "vague" means things like "Journalist assaulted" where AL wasn't mentioned but got tagged?
// 
// Let's implement a script that removes "Awami League" tag from events where:
// 1. The summary explicitly says "BNP" or others did it, and AL isn't mentioned as victim.
// 2. Or standardizes "Former AL leader" to just "AL" if helpful?
//
// Actually, I'll filter out specific known "noise" keywords if they exist.
// But given the user's vague request ("too much vouge"), I'll try to find events where AL is tagged
// but NOT mentioned in the title/summary in Bengali or English.

async function main() {
    console.log("🧹 Purifying Awami League Tags...");

    const events = await prisma.politicalEvent.findMany({
        where: {
            politicalParties: { contains: 'Awami League' }
        },
        select: { id: true, title: true, summary: true, politicalParties: true }
    });

    let removedCount = 0;

    for (const event of events) {
        const text = (event.title + " " + event.summary).toLowerCase();
        // Check if "Awami", "League", "AL", "Chattra", "Juba", "BCL" appear in text
        // If NONE appear, why is it tagged? (Likely finding previous "AL" substring matches that were converted but valid source text didn't have it?)
        // Keywords to check presence of:
        const keywords = [
            "awami", "league", "al ", " al", "(al)", "[al]", "chhatra", "bcl", "juba", "swechasebak", "sramik", "krishak", "mohila",
            "আওয়ামী", "লীগ", "ছাত্রলীগ", "যুবলীগ", "স্বেচ্ছাসেবক", "শ্রমিক", "কৃষক", "মহিলা"
        ];

        const hasMention = keywords.some(k => text.includes(k));

        if (!hasMention) {
            console.log(`\n❌ Removing AL tag from ID: ${event.id}`);
            console.log(`   Title: ${event.title}`);
            console.log(`   Parties: ${event.politicalParties}`);
            console.log(`   Reason: No AL keywords found in text.`);

            // Remove "Awami League" from JSON array
            try {
                let parties = JSON.parse(event.politicalParties || "[]");
                parties = parties.filter((p: string) => p !== "Awami League");

                await prisma.politicalEvent.update({
                    where: { id: event.id },
                    data: { politicalParties: JSON.stringify(parties) }
                });
                removedCount++;
            } catch (e) {
                console.error("   Failed to parse/update JSON");
            }
        }
    }

    console.log(`\n🎉 Removed AL tag from ${removedCount} events where text didn't support it.`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
