
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const events = await prisma.politicalEvent.findMany({
        where: {
            title: {
                contains: 'কেরানীগঞ্জে'
            }
        },
        select: {
            id: true,
            title: true,
            dateOfIncident: true,
            url: true,
            additionalSources: true
        }
    });

    console.log("Found Events:");
    events.forEach(e => {
        console.log(`ID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`URL: ${e.url}`);
        console.log(`AddSources: ${e.additionalSources}`);
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
