
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const start2026 = new Date('2026-01-01')

    const events = await prisma.politicalEvent.findMany({
        where: {
            publishedAt: {
                gte: start2026
            },
            OR: [
                { summary: { contains: "২০২৪" } },
                { summary: { contains: "২০২৩" } },
                { summary: { contains: "2024" } },
                { summary: { contains: "2023" } }
            ]
        },
        select: {
            id: true,
            title: true,
            summary: true
        }
    })

    console.log(`📊 Remaining Bad Summaries: ${events.length}`)
    events.forEach(e => {
        console.log(` - [${e.id}] ${e.title.substring(0, 30)}... : ${e.summary?.substring(0, 50)}...`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
