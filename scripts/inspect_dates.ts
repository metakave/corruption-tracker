
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const events = await prisma.politicalEvent.findMany({
        orderBy: { publishedAt: 'desc' }
    })

    console.log(`\nFound ${events.length} Events. Listing Details:`)
    console.log("------------------------------------------------")

    events.forEach(e => {
        console.log(`[${e.source}] ${e.title.substring(0, 40)}...`)
        console.log(`   Published: ${e.publishedAt.toISOString()}`)
        console.log(`   Created:   ${e.createdAt.toISOString()}`)
        console.log(`   URL:       ${e.url}`)
    })
}

main()
    .finally(() => prisma.$disconnect())
