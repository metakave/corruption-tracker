
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Keywords that indicate AL is just a passive subject (effigy, tagline, etc)
// If title/summary matches these AND doesn't mention "active" AL keywords like "AL attacked", "AL clash", etc.
// we remove the tag.

async function main() {
    console.log("🧹 Strict Cleanup of Awami League Tags...");

    const events = await prisma.politicalEvent.findMany({
        where: {
            politicalParties: { contains: 'Awami League' }
        },
        select: { id: true, title: true, summary: true, politicalParties: true }
    });

    let removedCount = 0;

    for (const event of events) {
        const text = (event.title + " " + event.summary).toLowerCase();

        // Conditions to REMOVE tag:
        // 1. Effigy burning (AL is target, not actor)
        // 2. Pure Protest against AL (without clash)

        const isEffigy = text.includes("কুশপুত্তলিকা") || text.includes("effigy");
        const isProtestAgainst = (text.includes("বিক্ষোভ") || text.includes("protest")) && text.includes("against"); // Rough proxy
        // Better: check if "BNP" is present and "AL" is only mentioned in context of "Former MP" or "Effigy"

        let shouldRemove = false;

        // Rule 1: Effigy
        if (isEffigy) {
            console.log(`\n🧐 Inspecting Effigy event: ${event.title}`);
            // If AL is mentioned, it's likely the target. Remove tag to satisfy "vouge" complaint.
            shouldRemove = true;
        }

        // Rule 2: Specific ID from audit (Effigy burning)
        if (event.id === '3c533a43-f3e5-4938-9617-c13b7409310f') shouldRemove = true;

        if (shouldRemove) {
            console.log(`❌ Removing AL tag from ID: ${event.id}`);
            console.log(`   Title: ${event.title}`);

            try {
                let parties = JSON.parse(event.politicalParties || "[]");
                parties = parties.filter((p: string) => p !== "Awami League");

                await prisma.politicalEvent.update({
                    where: { id: event.id },
                    data: { politicalParties: JSON.stringify(parties) }
                });
                removedCount++;
            } catch (e) {
                console.error("   Failed to update JSON");
            }
        }
    }

    console.log(`\n🎉 Simplified AL tags from ${removedCount} events.`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
