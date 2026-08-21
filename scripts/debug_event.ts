
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const events = await prisma.politicalEvent.findMany({
        where: {
            title: { contains: 'মাথায় গুলি করে বিএনপি নেতাকে হত্যা' }
        },
        take: 1
    })

    if (events.length > 0) {
        console.log('--- EVENT DATA ---')
        console.log('Title:', events[0].title)
        console.log('PublishedAt:', events[0].publishedAt)
        console.log('DateOfIncident:', events[0].dateOfIncident)
        console.log('Content Snippet:', events[0].rawText?.substring(0, 1000))
    } else {
        console.log('Event not found')
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
