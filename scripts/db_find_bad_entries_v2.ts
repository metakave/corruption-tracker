import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Searching for bad entries (Broad Search)...");

    const keywords = [
        "সায়েদুর রহমান", // Sayedur Rahman
        "বিটিআরসি",      // BTRC
        "ফোন"            // Phone
    ];

    for (const keyword of keywords) {
        console.log(`\n--- Searching for: "${keyword}" ---`);
        const events = await prisma.politicalEvent.findMany({
            where: {
                title: { contains: keyword }
            }
        });

        if (events.length === 0) {
            console.log("No matches found.");
        } else {
            console.log(`Found ${events.length} matches:`);
            events.forEach(e => {
                console.log(`[ID: ${e.id}] ${e.title} (URL: ${e.url})`);
            });
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
