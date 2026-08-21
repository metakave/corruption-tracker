
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const idsToDelete = [
    "017c6b54-d84d-45df-984e-33630f0f4a21",
    "d8e3d3ba-1772-4b2e-a57e-3944d183955d",
    "a909dddf-b3e3-4d43-982e-9d8a56c07525",
    "e44d34f0-bc37-4d7a-af39-8260b432a511",
    "e2101072-4f0e-41eb-81c0-08f300170564",
    "bc8c741e-6c0b-417d-8153-f7207c4d5705",
    "c62256df-7f12-4217-abc8-70139e830e01",
    "a181829e-64d1-443b-810a-d8098c255018",
    "79a25614-d41a-4173-9da9-df1f1196f66f",
    "e0b965f7-3475-47e9-a316-f6424564c856",
    "f51253a6-8902-4c28-9d41-c1209b57560e",
    "b73528b8-64c8-479e-a82f-2875141097e3",
    "d0526742-0f9c-4475-acb2-850901509939",
    "c928437a-4c29-450b-8d00-47805164d1c2"
];

async function main() {
    console.log(`Deleting ${idsToDelete.length} events not found in report...`);

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
