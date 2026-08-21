
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const url = 'https://www.prothomalo.com/bangladesh/crime/l825ii35tm'
    console.log(`Searching for URL: ${url}`)

    // Check main URL
    const event = await prisma.politicalEvent.findUnique({
        where: { url: url }
    })

    if (event) {
        console.log("Found as Main Event:")
        console.log(event)
    } else {
        console.log("Not found as main event.")
    }

    // Check inside additionalSources of ALL events is expensive but necessary if it's merged
    const all = await prisma.politicalEvent.findMany()
    const merged = all.filter(e => e.additionalSources && e.additionalSources.includes('l825ii35tm'))

    if (merged.length > 0) {
        console.log(`Found inside ${merged.length} events as source:`)
        merged.forEach(e => {
            console.log(`[${e.id}] ${e.title}`)
            console.log(e.additionalSources)
        })
    }
}

main()
    .finally(() => prisma.$disconnect())
