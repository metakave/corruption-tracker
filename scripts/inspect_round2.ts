
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- DEADLIEST CHECK (5 KILLED) ---')
    const deadliest = await prisma.politicalEvent.findMany({
        where: { killed: { gte: 5 } },
        orderBy: { killed: 'desc' }
    })
    console.log(JSON.stringify(deadliest, null, 2))

    console.log('--- TODAY STATS DETAILED CHECK ---')
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    // Get all events published today
    const todays = await prisma.politicalEvent.findMany({
        where: { publishedAt: { gte: startOfToday } },
        select: {
            id: true,
            title: true,
            district: true,
            publishedAt: true,
            dateOfIncident: true,
            source: true
        },
        orderBy: { title: 'asc' }
    })

    console.log(`Found ${todays.length} events for today`)
    // Log all to check patterns
    console.log(JSON.stringify(todays, null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
