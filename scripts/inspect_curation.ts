
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 INSPECTING CURATION TARGETS")
    console.log("============================")

    // 1. Naim Kibria Event (l825ii35tm)
    console.log("\n1. Naim Kibria Event (l825ii35tm)")
    const naimEvents = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { url: { contains: 'l825ii35tm' } },
                { additionalSources: { contains: 'l825ii35tm' } }
            ]
        }
    })
    naimEvents.forEach(e => {
        console.log(`[ID: ${e.id}] ${e.title}`)
        console.log(`Sources: ${e.additionalSources}`)
    })

    // 2. BTRC Event (421482 or Title Search)
    console.log("\n2. BTRC Event")
    const btrcEvents = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'বিটিআরসি' } },
                { title: { contains: 'BTRC' } }
            ]
        }
    })
    btrcEvents.forEach(e => {
        console.log(`[ID: ${e.id}] ${e.title}`)
        console.log(`Sources: ${e.additionalSources}`)
    })

    // 3. Raw Articles for New Event
    const newLinks = [
        'https://www.prothomalo.com/bangladesh/capital/l34es0dtdg',
        'https://www.prothomalo.com/bangladesh/capital/wdn6fguboj'
    ]
    console.log("\n3. Raw Articles for New Incident")
    const rawArticles = await prisma.rawNewsArticle.findMany({
        where: {
            url: { in: newLinks }
        }
    })
    rawArticles.forEach(a => {
        console.log(`[FOUND] ${a.url}`)
        console.log(`Title: ${a.title}`)
        console.log(`Content Len: ${a.content?.length}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
