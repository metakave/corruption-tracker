
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- DEEP DUPLICATE INSPECTION (LAST 72H) ---')

    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const events = await prisma.politicalEvent.findMany({
        where: { publishedAt: { gte: threeDaysAgo } },
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

    console.log(`Found ${events.length} events in last 3 days`)
    console.log('--- SORTED BY TITLE ---')
    events.forEach(e => {
        console.log(`[${e.district}] ${e.title} (${e.source}) - ${e.publishedAt.toISOString().split('T')[0]}`)
    })

    console.log('\n--- SORTED BY DISTRICT ---')
    const sortedByDistrict = [...events].sort((a, b) => (a.district || '').localeCompare(b.district || ''))
    sortedByDistrict.forEach(e => {
        console.log(`[${e.district}] ${e.title}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
