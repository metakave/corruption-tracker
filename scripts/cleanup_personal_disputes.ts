
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Cleaning Personal Disputes from Awami League Tags...");

    const events = await prisma.politicalEvent.findMany({
        where: {
            politicalParties: { contains: 'Awami League' }
        },
        select: { id: true, title: true, summary: true, politicalParties: true }
    });

    let removedCount = 0;

    // Keywords indicating personal/non-political dispute
    const disputeKeywords = [
        "জমি", // Land
        "বিরোধ", // Dispute (often appears with land)
        "পারিবারিক", // Family
        "টাকা", // Money
        "পাওনা", // Dues
        "পরকীয়া", // Extramarital affair
        "পূর্বশত্রুতা", // Personal enmity (sometimes political, but often personal)
        "land dispute",
        "family dispute",
        "money"
    ];

    for (const event of events) {
        const text = (event.title + " " + event.summary).toLowerCase();

        // strict text check for dispute context
        const isPersonal = disputeKeywords.some(k => text.includes(k));

        if (isPersonal) {
            console.log(`\n🧐 Inspecting Potential Personal Dispute: ${event.title}`);
            console.log(`   Summary: ${event.summary?.substring(0, 80)}...`);

            // If it explicitly mentions "political" (রাজনৈতিক), keep it.
            if (text.includes("রাজনৈতিক") || text.includes("political")) {
                console.log("   --> Keeping (Explicitly Political).");
                continue;
            }

            console.log(`❌ Removing AL tag from ID: ${event.id}`);
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

    console.log(`\n🎉 Cleared AL tags from ${removedCount} personal dispute events.`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
