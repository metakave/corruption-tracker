
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const keywords = ['মাহদী হাসানের মুক্তির দাবিতে', 'নেতার মুক্তির দাবিতে শাহবাগে'];
    console.log(`Searching for events containing: ${keywords.join(' OR ')}`);

    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: keywords.map(k => ({
                title: {
                    contains: k
                }
            }))
        }
    });

    if (events.length === 0) {
        console.log("No related events found.");
        return;
    }

    console.log(`Found ${events.length} events:`);
    events.forEach(e => {
        console.log(`ID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`URL: ${e.url}`);
        console.log(`Sources: ${e.source}`);
        console.log('---');
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
