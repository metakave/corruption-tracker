
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AL_KEYWORDS = [
    "Awami League", "Chhatra League", "BCL", "Juba League", "Swechasebak League", "Sramik League", "Krishak League", "Mohila Awami League",
    "আওয়ামী লীগ", "ছাত্রলীগ", "যুবলীগ", "স্বেচ্ছাসেবক লীগ", "শ্রমিক লীগ", "কৃষক লীগ", "মহিলা আওয়ামী লীগ"
];

async function main() {
    console.log("🔍 DEEP AUDIT of Awami League Events...");

    // Filter using the exact same logic as the API
    const keywordConditions = AL_KEYWORDS.map(k => ({
        politicalParties: { contains: k, mode: 'insensitive' }
    }));

    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: keywordConditions
        },
        select: {
            id: true,
            title: true,
            summary: true,
            politicalParties: true,
            victimParties: true,
            perpetratorParties: true
        },
        orderBy: { dateOfIncident: 'desc' }
    });

    console.log(`Found ${events.length} TOTAL events.`);
    console.log("===================================================");

    events.forEach(e => {
        console.log(`ID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`Parties Involved: ${e.politicalParties}`);
        console.log(`Summary: ${e.summary}`);
        console.log("---------------------------------------------------");
    });
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
