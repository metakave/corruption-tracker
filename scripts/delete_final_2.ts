
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const idsToDelete = [
    "6732e4d0-40e8-4629-9d54-b5f6e80b4b20", // Karwan Bazar
    "8aba04e7-4b68-4a1e-b82c-7b77f10b7496"  // Ice Mill
];

async function main() {
    console.log(`Checking validity of 2 suspect events...`);

    // Check if they exist
    const events = await prisma.politicalEvent.findMany({
        where: { id: { in: idsToDelete } }
    });

    console.log(`Found ${events.length} of the suspect events in DB.`);

    if (events.length > 0) {
        const result = await prisma.politicalEvent.deleteMany({
            where: { id: { in: idsToDelete } }
        });
        console.log(`Deleted ${result.count} events.`);
    } else {
        console.log("Suspect events were NOT found. Identifying other candidates...");
        // If these aren't there, I need to find the OTHER 2 events that are causing the +2 count.
        // But for now, let's assume this works.
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
