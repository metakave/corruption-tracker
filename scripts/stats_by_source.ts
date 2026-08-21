import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('\n📊 ARTICLE COUNT BY SOURCE');
        console.log('---------------------------');

        const sourceStats = await prisma.rawNewsArticle.groupBy({
            by: ['source'],
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        });

        sourceStats.forEach(stat => {
            console.log(`${stat.source.padEnd(20)}: ${stat._count.id} articles`);
        });

        console.log('---------------------------\n');

        // Also check "invalid date" errors in logs if possible, but simplest is yield.

    } catch (error) {
        console.error('Error fetching source stats:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
