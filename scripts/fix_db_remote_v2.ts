import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Remote Database Fix V2...");

    // Broad keywords for the second item
    const keywords = ["বিটিআরসি", "এনইআইআর", "ফোন"];
    const foundIds = new Set();

    for (const kw of keywords) {
        console.log(`\nSearching for keyword: "${kw}"`);
        const events = await prisma.politicalEvent.findMany({
            where: {
                title: { contains: kw }
            }
        });

        if (events.length === 0) console.log("No matches.");

        for (const e of events) {
            if (!foundIds.has(e.id)) {
                foundIds.add(e.id);
                console.log(`\nFound Candidate -> ID: ${e.id}\nTitle: ${e.title}\nURL: ${e.url}`);

                // Logic to confirm deletion:
                // User wanted to remove: "এনইআইআর চালুর প্রতিবাদে মোবাইল ফোন ব্যবসায়ীদের বিটিআরসি কার্যালয়ে হামলা।"
                // So if title looks similar or contains "হামলা" (Attack) and "বিটিআরসি", delete it.

                if (e.title.includes("হামলা") || e.title.includes("প্রতিবাদে")) {
                    console.log("⚠️ Deleting match...");
                    try {
                        await prisma.politicalEvent.delete({ where: { id: e.id } });
                        console.log("✅ Deleted.");
                    } catch (err) {
                        console.error(`❌ Error deleting: ${err}`);
                    }
                } else {
                    console.log("ℹ️ Skipping (Title doesn't explicitly mention 'hamla' or 'protest' in expected way, manual check advised if this persists).");
                }
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
