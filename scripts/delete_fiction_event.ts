import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const targetUrl = 'https://www.prothomalo.com/onnoalo/stories/j34qqzar32'

    console.log(`Searching for event with URL: ${targetUrl}`)

    const event = await prisma.politicalEvent.findUnique({
        where: { url: targetUrl }
    })

    if (event) {
        console.log(`Found event: [${event.id}] ${event.title}`)
        await prisma.politicalEvent.delete({
            where: { id: event.id }
        })
        console.log(`✅ Deleted event ${event.id}`)
    } else {
        console.log(`⚪ Event not found in database.`)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
