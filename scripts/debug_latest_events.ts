
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Inspecting latest 5 Political Events...")
    const events = await prisma.politicalEvent.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            url: true,
            publishedAt: true,
            dateOfIncident: true,
            createdAt: true
        }
    })

    for (const event of events) {
        console.log(`\nEvent: ${event.title.substring(0, 40)}...`)
        console.log(`   ID: ${event.id}`)
        console.log(`   URL: ${event.url}`)
        console.log(`   Event.publishedAt:    ${event.publishedAt.toISOString()}`)
        console.log(`   Event.dateOfIncident: ${event.dateOfIncident ? event.dateOfIncident.toISOString() : 'NULL'}`)
        console.log(`   Event.createdAt:      ${event.createdAt.toISOString()}`)

        // Check Raw
        const raw = await prisma.rawNewsArticle.findUnique({
            where: { url: event.url }
        })
        if (raw) {
            console.log(`   Raw.publishedAt:      ${raw.publishedAt.toISOString()}`)
            console.log(`   Raw.scrapedAt:        ${raw.scrapedAt.toISOString()}`)
        } else {
            console.log(`   ⚠️ NO RAW MATCH FOUND`)
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
