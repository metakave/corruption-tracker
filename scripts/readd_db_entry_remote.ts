import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Re-adding BTRC Attack Event...");

    const event = {
        title: "এনইআইআর চালুর প্রতিবাদ বিটিআরসিতে মোবাইল ফোন ব্যবসায়ীদের হামলা",
        url: "https://www.jugantor.com/national/1047452",
        source: "Jugantor",
        publishedAt: new Date(), // Using current time as fallback
        dateOfIncident: new Date(),
        summary: "এনইআইআর চালুর প্রতিবাদে বিটিআরসি কার্যালয়ে মোবাইল ফোন ব্যবসায়ীদের হামলা ও ভাঙচুরের ঘটনা ঘটেছে।",
        isBangladesh: true,
        isPoliticalViolence: true,
        severityScore: 6, // Estimated for office attack
        confidence: 1.0,  // Manual entry
        tags: JSON.stringify(["BTRC", "Attack", "Protest", "Businessmen"]),
        actors: "Mobile Phone Businessmen"
    };

    try {
        const result = await prisma.politicalEvent.create({
            data: event
        });
        console.log(`✅ Successfully added event.`);
        console.log(`ID: ${result.id}`);
        console.log(`Title: ${result.title}`);
        console.log(`URL: ${result.url}`);
    } catch (e) {
        // If it failed because of unique constraint (maybe it wasn't actually deleted or I'm running locally?), check that.
        console.error(`❌ Failed to add event: ${e}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
