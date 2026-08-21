
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const events = await prisma.politicalEvent.findMany({
        where: {
            title: {
                contains: 'নাঈম'
            }
        }
    })

    console.log(`Found ${events.length} events matching 'নাঈম'`)

    for (const e of events) {
        console.log(`ID: ${e.id}`)
        console.log(`Title: ${e.title}`)
        console.log(`Sources Raw: ${e.additionalSources}`)
    }
}

main()
    .finally(() => prisma.$disconnect())
