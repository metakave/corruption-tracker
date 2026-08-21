
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const id = "d144bf62-357d-4f20-8b5b-3a51f689da57";
    const event = await prisma.politicalEvent.findUnique({
        where: { id }
    });

    console.log(JSON.stringify(event, null, 2));
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
