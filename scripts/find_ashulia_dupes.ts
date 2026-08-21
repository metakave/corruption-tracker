
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Searching for Ashulia BNP events...")

    const events = await prisma.politicalEvent.findMany({
        where: {
            title: {
                contains: 'আশুলিয়ায় বিএনপির',
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            title: true,
            dateOfIncident: true,
            source: true,
            killed: true,
            injured: true,
            url: true
        }
    })

    console.log(`Found ${events.length} events:`)
    events.forEach(e => {
        console.log(`ID: ${e.id} | Date: ${e.dateOfIncident?.toISOString().split('T')[0]} | Source: ${e.source}`)
        console.log(`Title: ${e.title}`)
        console.log(`Stats: Killed ${e.killed}, Injured ${e.injured}`)
        console.log(`URL: ${e.url}`)
        console.log("-".repeat(40))
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
