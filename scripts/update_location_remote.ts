import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Updating Location for BTRC Event...");

    const targetUrl = "https://www.jugantor.com/national/1047452";

    // User input: location is dhaka তেজগাঁও  বিটিআরসি ভবন
    const updates = {
        district: "Dhaka",
        locationText: "তেজগাঁও বিটিআরসি ভবন" // Tejgaon BTRC Building
    };

    try {
        const event = await prisma.politicalEvent.update({
            where: { url: targetUrl },
            data: updates
        });

        console.log(`✅ Successfully updated event.`);
        console.log(`ID: ${event.id}`);
        console.log(`New District: ${event.district}`);
        console.log(`New Location: ${event.locationText}`);
    } catch (e) {
        console.error(`❌ Failed to update event: ${e}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
