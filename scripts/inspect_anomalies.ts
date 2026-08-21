
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- DEADLIEST CHECK ---')
    // Find the event with high killed count
    const deadliest = await prisma.politicalEvent.findMany({
        orderBy: { killed: 'desc' },
        take: 3
    })

    console.log(JSON.stringify(deadliest, null, 2))

    console.log('--- TODAY STATS CHECK ---')
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const todays = await prisma.politicalEvent.findMany({
        where: { publishedAt: { gte: startOfToday } },
        select: { id: true, title: true, publishedAt: true, source: true, url: true }
    })

    console.log(`Found ${todays.length} events for today`)
    console.log(JSON.stringify(todays.slice(0, 5), null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
