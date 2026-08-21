
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const AL_KEYWORDS = ["Awami League", "Chhatra League", "BCL", "Juba League", "Swechasebak League", "Sramik League", "Krishak League", "Mohila Awami League", "আওয়ামী লীগ", "ছাত্রলীগ", "যুবলীগ", "স্বেচ্ছাসেবক লীগ", "শ্রমিক লীগ", "কৃষক লীগ", "মহিলা আওয়ামী লীগ"];

async function main() {
    const keywordConditions = AL_KEYWORDS.map(k => ({
        politicalParties: { contains: k, mode: 'insensitive' }
    }));
    const count = await prisma.politicalEvent.count({
        where: { OR: keywordConditions }
    });
    console.log(`Final Awami League Count: ${count}`);
}

main().finally(async () => { await prisma.$disconnect(); });
