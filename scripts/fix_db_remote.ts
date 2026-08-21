import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Remote Database Fix...");

    // Targets to remove
    const targets = [
        "সায়েদুর রহমান", // Part of title 1: Chief Adviser's Special Assistant...
        "বিটিআরসি কার্যালয়ে হামলা" // Part of title 2: Attack on BTRC office...
    ];

    for (const target of targets) {
        console.log(`\n--- Searching for: "${target}" ---`);
        const events = await prisma.politicalEvent.findMany({
            where: {
                title: { contains: target }
            }
        });

        if (events.length > 0) {
            console.log(`Found ${events.length} events matching "${target}".`);
            for (const e of events) {
                console.log(`Deleting Event -> ID: ${e.id}\nTitle: ${e.title}\nURL: ${e.url}`);
                try {
                    await prisma.politicalEvent.delete({ where: { id: e.id } });
                    console.log("✅ Deleted successfully.");
                } catch (err) {
                    console.error(`❌ Failed to delete: ${err}`);
                }
            }
        } else {
            console.log(`No events found matching "${target}".`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
