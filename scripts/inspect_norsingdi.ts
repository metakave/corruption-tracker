
import { prisma } from '../lib/db';

async function main() {
    const event = await prisma.politicalEvent.findFirst({
        where: {
            title: {
                contains: 'নরসিংদীতে ডেকে নিয়ে'
            }
        }
    });

    if (event) {
        console.log("Event Found:");
        console.log("Title:", event.title);
        console.log("Political Parties:", event.politicalParties);
        console.log("Summary:", event.summary);
    } else {
        console.log("Event NOT found");
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
