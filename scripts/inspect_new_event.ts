
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Inspecting Data Format...");

    // Find one of the new events (from Jan 2026, newly imported)
    // "শরীয়তপুরে দফায় দফায় সংঘর্ষ" was one of them.
    const event = await prisma.politicalEvent.findFirst({
        where: {
            title: { contains: 'শরীয়তপুরে' }
        }
    });

    if (!event) {
        console.log("❌ Event not found!");
        return;
    }

    console.log(`\nEvent ID: ${event.id}`);
    console.log(`Title: ${event.title}`);
    console.log(`Political Parties (Raw): >${event.politicalParties}<`);
    console.log(`Political Parties Type: ${typeof event.politicalParties}`);

    // Check if it matches "AL"
    const matchesAL = event.politicalParties?.includes('AL');
    console.log(`Includes 'AL'? ${matchesAL}`);

    // Check if it matches "Awami League"
    const matchesFull = event.politicalParties?.includes('Awami League');
    console.log(`Includes 'Awami League'? ${matchesFull}`);

    // Check Date format
    console.log(`DateOfIncident: ${event.dateOfIncident}`);
    console.log(`PublishedAt: ${event.publishedAt}`);

}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
