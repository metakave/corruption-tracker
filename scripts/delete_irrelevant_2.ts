
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const idsToDelete = [
    "dee6521d-5de9-4f70-97b8-3263478e0b0f", // Electrocuted thief
    "45425b20-3fa2-4b46-9233-018607fdbcfa"  // Drowning thief
];

async function main() {
    console.log(`Deleting 2 irrelevant deadly events to sync stats...`);

    const result = await prisma.politicalEvent.deleteMany({
        where: { id: { in: idsToDelete } }
    });

    console.log(`Deleted ${result.count} events.`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
