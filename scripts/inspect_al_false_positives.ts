
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_KEYWORDS = [
    "Awami League", "AL", "Chhatra League", "BCL", "Juba League", "Swechasebak League", "Sramik League", "Krishak League", "Mohila Awami League",
    "আওয়ামী লীগ", "ছাত্রলীগ", "যুবলীগ", "স্বেচ্ছাসেবক লীগ", "শ্রমিক লীগ", "কৃষক লীগ", "মহিলা আওয়ামী লীগ"
];

async function main() {
    console.log("🔍 Inspecting Awami League Matches...");

    const keywordConditions = CATEGORY_KEYWORDS.map(k => ({
        politicalParties: { contains: k, mode: 'insensitive' }
    }));

    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: keywordConditions
        },
        select: {
            id: true,
            title: true,
            politicalParties: true,
            summary: true
        },
        orderBy: { dateOfIncident: 'desc' },
        take: 100
    });

    console.log(`Found ${events.length} events.`);

    events.forEach(e => {
        // Highlight WHICH keyword matched
        const matched = CATEGORY_KEYWORDS.filter(k =>
            (e.politicalParties || "").toLowerCase().includes(k.toLowerCase())
        );

        console.log(`\nID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`Parties: ${e.politicalParties}`);
        console.log(`Matched Keywords: ${matched.join(', ')}`);

        // Check for specific "AL" noise
        if (matched.includes("AL") && matched.length === 1) {
            console.log("⚠️  WARN: Matched ONLY on 'AL'");
        }
    });
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
