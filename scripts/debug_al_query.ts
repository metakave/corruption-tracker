
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_KEYWORDS = [
    "Awami League", "AL", "Chhatra League", "BCL", "Juba League", "Swechasebak League", "Sramik League", "Krishak League", "Mohila Awami League",
    "আওয়ামী লীগ", "ছাত্রলীগ", "যুবলীগ", "স্বেচ্ছাসেবক লীগ", "শ্রমিক লীগ", "কৃষক লীগ", "মহিলা আওয়ামী লীগ"
];

async function main() {
    console.log("🔍 Debugging AL Query...");

    // 1. Simulate API Query Logic exactly
    const keywordConditions = CATEGORY_KEYWORDS.map(k => ({
        politicalParties: { contains: k }
    }));

    const apiQuery = {
        OR: keywordConditions
    };

    const count = await prisma.politicalEvent.count({ where: apiQuery });
    console.log(`\n1. API Logic Count (OR conditions): ${count}`);

    // 2. Dump a few to see format
    const events = await prisma.politicalEvent.findMany({
        where: apiQuery,
        take: 5,
        select: { id: true, title: true, politicalParties: true }
    });

    console.log("\nSample Events found by API Logic:");
    events.forEach(e => console.log(`   [${e.id}] ${e.politicalParties} - ${e.title}`));

    // 3. Broad Search to see what's missing
    // Find events that contain "AL" but were NOT caught by the above (if any)
    const broadEvents = await prisma.politicalEvent.findMany({
        where: {
            politicalParties: { contains: 'AL' }
        },
        select: { id: true, politicalParties: true }
    });

    console.log(`\n2. Simple 'contains AL' count: ${broadEvents.length}`);

    // Check Case Sensitivity
    const lowerCount = await prisma.politicalEvent.count({
        where: { politicalParties: { contains: 'al' } } // lowercase
    });
    console.log(`\n3. Lowercase 'al' count: ${lowerCount}`);

    // Check if case insensitive mode is needed
    const insensitiveCount = await prisma.politicalEvent.count({
        where: { politicalParties: { contains: 'al', mode: 'insensitive' } }
    });
    console.log(`\n4. Insensitive 'al' count: ${insensitiveCount}`);

}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
