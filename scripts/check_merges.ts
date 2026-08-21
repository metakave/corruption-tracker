
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMerges() {
    const events = await prisma.politicalEvent.findMany({
        where: {
            additionalSources: {
                not: null
            }
        }
    })

    console.log(`Events with additional sources: ${events.length}`)
    events.forEach(e => {
        console.log(`- ${e.title}: ${e.additionalSources}`)
    })

    const totalEvents = await prisma.politicalEvent.count()
    console.log(`Total Events: ${totalEvents}`)
}

checkMerges()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
