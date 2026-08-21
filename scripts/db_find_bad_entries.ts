import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Searching for bad entries...");

    const keywords = [
        "প্রধান উপদেষ্টার বিশেষ সহকারী",
        "বিটিআরসি কার্যালয়ে হামলা"
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
                console.log(`\nID: ${e.id}`);
                console.log(`Title: ${e.title}`);
                console.log(`URL: ${e.url}`);
                console.log(`Created: ${e.createdAt}`);
                console.log(`Summary: ${e.summary}`);
            });
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
