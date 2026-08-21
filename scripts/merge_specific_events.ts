
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_ID = 'b404e73f-50ca-4f8d-8253-2d9348c1cce6'; // Keep this (Motive known)
const SOURCE_ID = 'adf8cfcf-7219-4116-a675-e8e27c1f7eaf'; // Delete this (Body recovery)

async function main() {
    console.log(`Merging ${SOURCE_ID} into ${TARGET_ID}...`);

    // Get Source Event
    const sourceEvent = await prisma.politicalEvent.findUnique({
        where: { id: SOURCE_ID }
    });

    if (!sourceEvent) {
        console.error("Source event not found!");
        return;
    }

    const targetEvent = await prisma.politicalEvent.findUnique({
        where: { id: TARGET_ID }
    });

    if (!targetEvent) {
        console.error("Target event not found!");
        return;
    }

    // Parse existing sources
    let existingSources: any[] = [];
    if (targetEvent.additionalSources) {
        try {
            existingSources = JSON.parse(targetEvent.additionalSources);
        } catch {
            existingSources = [];
        }
    }

    // Create new source object
    const newSource = {
        url: sourceEvent.url,
        source: sourceEvent.source || 'Jugantor', // Jugantor based on domain
        title: sourceEvent.title
    };

    // Add to sources if not exists
    if (!existingSources.some((s: any) => s.url === newSource.url)) {
        existingSources.push(newSource);
    }

    // Update Target
    await prisma.politicalEvent.update({
        where: { id: TARGET_ID },
        data: {
            additionalSources: JSON.stringify(existingSources)
        }
    });
    console.log("Updated target event sources.");

    // Delete Source
    await prisma.politicalEvent.delete({
        where: { id: SOURCE_ID }
    });
    console.log("Deleted source event.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
