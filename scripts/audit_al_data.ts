
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AL_KEYWORDS = [
    "Awami League", "Chhatra League", "BCL", "Juba League", "Swechasebak League", "Sramik League", "Krishak League", "Mohila Awami League",
    "আওয়ামী লীগ", "ছাত্রলীগ", "যুবলীগ", "স্বেচ্ছাসেবক লীগ", "শ্রমিক লীগ", "কৃষক লীগ", "মহিলা আওয়ামী লীগ"
];

async function main() {
    console.log("🔍 Auditing Awami League Events...");

    // Simulate the exact API filter
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
            politicalParties: true
        },
        orderBy: { dateOfIncident: 'desc' },
        take: 100
    });

    console.log(`Found ${events.length} events categorized as Awami League.`);
    console.log("---------------------------------------------------");

    events.forEach(e => {
        console.log(`ID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`Parties: ${e.politicalParties}`);
        console.log(`Summary: ${e.summary?.substring(0, 100)}...`);
        console.log("---");
    });
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
