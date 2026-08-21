
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const districts = await prisma.politicalEvent.groupBy({
        by: ['district'],
        _count: {
            district: true,
        },
        orderBy: {
            district: 'asc',
        },
    });

    console.log("Current Districts in DB:");
    districts.forEach(d => {
        console.log(`"${d.district}": ${d._count.district}`);
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
