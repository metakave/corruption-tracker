
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Check schema type (indirectly by seeing output)
    const events = await prisma.politicalEvent.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' } // Order by CREATED AT, not publishedAt
    })

    console.log(`\nLast 5 Created Events:`)

    events.forEach(e => {
        console.log(`[${e.source}] ${e.title.substring(0, 40)}...`)
        console.log(`   Published: ${e.publishedAt} (${typeof e.publishedAt})`)
        console.log(`   Created:   ${e.createdAt}`)
    })

    // 2. Check if we have any for today by range
    const start = new Date('2026-01-04T00:00:00Z')
    const end = new Date('2026-01-04T23:59:59Z')

    const count = await prisma.politicalEvent.count({
        where: {
            createdAt: {
                gte: start,
                lte: end
            }
        }
    })
    console.log(`\nEvents Created Today (Explicit Range): ${count}`)
}

main()
    .finally(() => prisma.$disconnect())
