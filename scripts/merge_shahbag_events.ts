
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_ID = '20fa9d72-c776-4d70-bf68-156c7eed9afb'; // Keep Mahdi Hasan
const SOURCE_ID = '2121f5fe-2529-4f64-846d-650ba974a695'; // Delete Generic

async function main() {
    console.log(`Merging ${SOURCE_ID} into ${TARGET_ID}...`);

    // Get Source
    const sourceEvent = await prisma.politicalEvent.findUnique({
        where: { id: SOURCE_ID }
    });
    if (!sourceEvent) return;

    // Get Target
    const targetEvent = await prisma.politicalEvent.findUnique({
        where: { id: TARGET_ID }
    });
    if (!targetEvent) return;

    // Handle Sources
    let existingSources: any[] = [];
    if (targetEvent.additionalSources) {
        try {
            const parsed = JSON.parse(targetEvent.additionalSources);
            if (Array.isArray(parsed)) existingSources = parsed;
        } catch { existingSources = []; }
    }

    const newSource = {
        url: sourceEvent.url,
        source: sourceEvent.source || 'Prothom Alo',
        title: sourceEvent.title
    };

    if (!existingSources.some((s: any) => s.url === newSource.url)) {
        existingSources.push(newSource);
    }

    // Update Target
    await prisma.politicalEvent.update({
        where: { id: TARGET_ID },
        data: {
            additionalSources: JSON.stringify(existingSources),
            politicalParties: JSON.stringify(["Boishommyobirodhi Chhatra Andolon"]) // Update Party
        }
    });

    // Delete Source
    await prisma.politicalEvent.delete({
        where: { id: SOURCE_ID }
    });

    console.log("✅ Merge Complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
