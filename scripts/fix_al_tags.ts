
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Fixing 'AL' tags in database...");

    // Fetch all events that might contain "AL" to be safe
    // We use the broad search to catch them, then refine in JS
    const events = await prisma.politicalEvent.findMany({
        where: {
            politicalParties: { contains: 'AL', mode: 'insensitive' }
        },
        select: { id: true, title: true, politicalParties: true }
    });

    console.log(`Scanning ${events.length} potential events...`);
    let fixedCount = 0;

    for (const event of events) {
        if (!event.politicalParties) continue;

        let parties: string[] = [];
        let raw = event.politicalParties;
        let needsUpdate = false;

        // Try parsing JSON
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                parties = parsed;

                // Check for exact "AL" tag
                const index = parties.indexOf("AL");
                if (index !== -1) {
                    console.log(`   Found 'AL' tag in: ${event.title} (${event.id})`);
                    parties[index] = "Awami League"; // Replace
                    needsUpdate = true;
                }
            } else {
                // String unlikely to match exact "AL" if not array, but good to check
                if (raw.trim() === "AL") {
                    parties = ["Awami League"];
                    needsUpdate = true;
                }
            }
        } catch (e) {
            // Not JSON, check if it's a simple string "AL"
            if (raw.trim() === "AL") {
                parties = ["Awami League"];
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            const newJson = JSON.stringify(parties);
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: { politicalParties: newJson }
            });
            console.log(`   ✅ Updated to: ${newJson}`);
            fixedCount++;
        }
    }

    console.log(`\n🎉 Finished! Fixed ${fixedCount} events.`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
