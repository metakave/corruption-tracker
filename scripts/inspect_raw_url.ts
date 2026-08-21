
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const searchId = '332456'
    console.log(`🔍 Searching RawNewsArticle for URL containing: '${searchId}'`)

    const articles = await prisma.rawNewsArticle.findMany({
        where: {
            url: {
                contains: searchId
            }
        }
    })

    console.log(`📊 Found ${articles.length} matching articles.`)

    for (const article of articles) {
        console.log(`\n---------------------------------------------------`)
        console.log(`ID: ${article.id}`)
        console.log(`URL: ${article.url}`)
        console.log(`\n📄 CONTENT (JSON Stringified):`)
        console.log(JSON.stringify(article.content))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
