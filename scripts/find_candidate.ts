import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Finding a candidate Raw Article for reprocessing...")

    // Look for articles from Jan 1st to Jan 3rd 2026
    const start = new Date('2026-01-01')
    const end = new Date('2026-01-03')

    const candidates = await prisma.rawNewsArticle.findMany({
        where: {
            scrapedAt: {
                gte: start,
                lte: end
            },
            title: {
                contains: 'হামলা' // Look for "attack" keyword to ensure it's likely violence
            }
        },
        take: 5
    })

    console.log(`✅ Found ${candidates.length} candidates:\n`)

    candidates.forEach((c, i) => {
        console.log(`${i + 1}. [${c.scrapedAt.toISOString().split('T')[0]}] ${c.title.substring(0, 60)}...`)
        console.log(`   URL: ${c.url}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
