
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const idsToDelete = [
    "73961f38-5c90-4fef-b900-b4f463e89019",
    "09d8eef3-355f-4190-be0f-39a3f9d83561",
    "08d713cb-7d46-447f-a004-44b8b318e28a",
    "b56056be-8088-48c8-95f6-67069cc92d0d",
    "f6499145-6aae-4050-8385-c756d40b0746",
    "39d6a5c2-8a12-4582-9844-caee650965e4",
    "7c6b15c4-f77a-40fd-bec8-c7ee638a25d3",
    "12095bd8-aae8-4996-afe0-d59868e8b44d",
    "be2d6740-7f01-4a9c-9132-569006a70b76",
    "6a6a6e5a-e4eb-4803-af97-bc83c9e8eec7",
    "490fb700-eec3-4ef4-8ec1-ab2f50d1a450",
    "d34eb2f5-805a-4994-bd19-fcc6e17ec16e"
];

async function main() {
    console.log(`Deleting ${idsToDelete.length} surplus events from January...`);

    const result = await prisma.politicalEvent.deleteMany({
        where: {
            id: { in: idsToDelete }
        }
    });

    console.log(`Deleted ${result.count} events.`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
