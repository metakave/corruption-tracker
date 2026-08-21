
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const targetDate = new Date('2025-12-30T12:00:00+06:00') // Noon BD time on 30th

    console.log(`Updating all events to date: ${targetDate.toISOString()}`)

    const result = await prisma.politicalEvent.updateMany({
        data: {
            publishedAt: targetDate
        }
    })

    console.log(`Updated ${result.count} events.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
