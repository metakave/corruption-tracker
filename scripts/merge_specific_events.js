const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function mergeEvents() {
    const keepId = '0209c7fd-fc8d-4e9f-aa4c-cc96e6993ee2';
    const deleteId = '7a8faeec-ff96-49ca-afbc-d66ca27db108';

    console.log(`🔄 Merging event ${deleteId} into ${keepId}...`);

    const keepEvent = await prisma.politicalEvent.findUnique({ where: { id: keepId } });
    const deleteEvent = await prisma.politicalEvent.findUnique({ where: { id: deleteId } });

    if (!keepEvent || !deleteEvent) {
        console.error("❌ One or both events not found!");
        return;
    }

    // Prepare combined sources
    const currentSources = keepEvent.additionalSources ? JSON.parse(keepEvent.additionalSources) : [];

    // Add the deleteEvent as a source to keepEvent
    const newSource = {
        url: deleteEvent.url,
        source: deleteEvent.source,
        title: deleteEvent.title
    };

    // Check if source already exists
    const exists = currentSources.find(s => s.url === deleteEvent.url);
    if (!exists) {
        currentSources.push(newSource);
    }

    // Update keepEvent
    await prisma.politicalEvent.update({
        where: { id: keepId },
        data: {
            additionalSources: JSON.stringify(currentSources),
            summary: keepEvent.summary + "\n\n" + deleteEvent.summary,
            updatedAt: new Date()
        }
    });

    // Delete deleteEvent
    await prisma.politicalEvent.delete({ where: { id: deleteId } });

    console.log("✅ Merge complete!");
}

mergeEvents()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
