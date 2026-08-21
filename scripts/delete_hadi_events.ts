
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const keywords = ['হাদি', 'শরিফ ওসমান']; // Hadi, Sharif Osman
    console.log(`Searching for events containing: ${keywords.join(', ')}`);

    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: keywords.map(k => ({
                title: {
                    contains: k
                }
            }))
        }
    });

    if (events.length === 0) {
        console.log("No related events found.");
        return;
    }

    console.log(`Found ${events.length} events to delete:`);
    events.forEach(e => console.log(`- ${e.title} (${e.id})`));

    // Delete
    const res = await prisma.politicalEvent.deleteMany({
        where: {
            id: {
                in: events.map(e => e.id)
            }
        }
    });

    console.log(`✅ Deleted ${res.count} events.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
