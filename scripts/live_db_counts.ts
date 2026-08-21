
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Get counts for the last 1 hour (covering the current run)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const counts = await prisma.rawNewsArticle.groupBy({
        by: ['source'],
        where: {
            scrapedAt: {
                gte: oneHourAgo
            }
        },
        _count: {
            id: true
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        }
    });

    console.log('\n📊 LIVE SCRAPE COUNTS (Last 60m)');
    console.log('--------------------------------');
    let total = 0;

    // Define expected sources
    const expected = ['Prothom Alo', 'Jugantor', 'Samakal', 'Ajker Patrika', 'Dhaka Post'];
    const foundSources = new Set<string>();

    counts.forEach(c => {
        const isExpected = expected.includes(c.source);
        const icon = isExpected ? '✅' : '❓';
        console.log(`${icon} ${c.source.padEnd(20)}: ${c._count.id}`);
        total += c._count.id;
        foundSources.add(c.source);
    });

    // Check for missing sources
    expected.forEach(src => {
        if (!foundSources.has(src)) {
            console.log(`⚠️ ${src.padEnd(20)}: 0 (or not started yet)`);
        }
    });

    console.log('--------------------------------');
    console.log(`TOTAL ARTICLES:      ${total}`);
    console.log('\nThis confirms exactly what the live crawler has collected so far.\n');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
