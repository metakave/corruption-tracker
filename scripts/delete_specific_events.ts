
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Deletion of Specific Events...");

    // Targets
    const targets = [
        "জানুয়ারিতে মব জাস্টিস ও রাজনৈতিক সহিংসতায় প্রাণহানি বৃদ্ধি",
        "সংখ্যালঘু সম্প্রদায়ের নিরাপত্তাহীনতা: ঐক্য পরিষদের উদ্বেগ"
    ];

    for (const titleFragment of targets) {
        const events = await prisma.politicalEvent.findMany({
            where: {
                title: {
                    contains: titleFragment
                }
            }
        });

        if (events.length > 0) {
            console.log(`Found ${events.length} events matching "${titleFragment}":`);
            for (const event of events) {
                console.log(` - Deleting ID: ${event.id} | Title: ${event.title}`);
                await prisma.politicalEvent.delete({
                    where: { id: event.id }
                });
            }
        } else {
            console.log(`❌ No events found matching "${titleFragment}"`);
        }
    }

    console.log("\n✅ Deletion Process Complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
