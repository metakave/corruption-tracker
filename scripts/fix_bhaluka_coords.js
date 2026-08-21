const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBhaluka() {
    const eventId = '929a6348-5d0c-4145-b9c1-43d73ab49626';
    const mymensinghCoords = { lat: 24.7471, lng: 90.4203 };

    console.log(`🔄 Updating event ${eventId} to Mymensingh coordinates...`);

    try {
        await prisma.politicalEvent.update({
            where: { id: eventId },
            data: {
                latitude: mymensinghCoords.lat,
                longitude: mymensinghCoords.lng,
                updatedAt: new Date()
            }
        });
        console.log("✅ Update complete!");
    } catch (e) {
        console.error("❌ Error updating event:", e);
    }
}

fixBhaluka()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
