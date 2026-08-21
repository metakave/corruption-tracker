
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const titleSnippet = 'এবি পার্টির কর্মীদের ওপর হামলা';
    console.log(`Searching for event with title containing: "${titleSnippet}"`);

    const events = await prisma.politicalEvent.findMany({
        where: {
            title: {
                contains: titleSnippet
            }
        }
    });

    if (events.length === 0) {
        console.log("No event found.");
        return;
    }

    if (events.length > 1) {
        console.log("Found multiple events. Please be more specific.");
        events.forEach(e => console.log(`- ${e.title} (${e.id})`));
        return;
    }

    const event = events[0];
    console.log(`Found event: ${event.title}`);
    console.log(`ID: ${event.id}`);

    // Delete
    await prisma.politicalEvent.delete({
        where: { id: event.id }
    });
    console.log("✅ Event deleted successfully.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
