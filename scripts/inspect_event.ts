
import { prisma } from '../lib/db';

async function main() {
    const input = process.argv[2] || 'তিন ঘণ্টা';
    console.log(`Searching for: ${input}`);
    const event = await prisma.politicalEvent.findFirst({
        where: {
            title: {
                contains: input
            }
        }
    });

    if (event) {
        console.log("Full Event Data:", JSON.stringify(event, null, 2));
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
