
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Existing Events:")
    const events = await prisma.politicalEvent.findMany({
        select: {
            id: true,
            title: true,
            url: true,
            additionalSources: true
        }
    })

    events.forEach(e => {
        console.log(`[${e.id}] ${e.title}`)
        console.log(`   URL: ${e.url}`)
        if (e.additionalSources) {
            console.log(`   Sources: ${e.additionalSources}`)
        }
        console.log('---')
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
