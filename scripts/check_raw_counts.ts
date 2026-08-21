
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const rawCounts = await prisma.rawNewsArticle.groupBy({
        by: ['source'],
        _count: {
            id: true
        }
    })

    console.log("\nRaw Articles by Source:")
    rawCounts.forEach(s => {
        console.log(`  - ${s.source}: ${s._count.id}`)
    })
}

main()
    .finally(() => prisma.$disconnect())
