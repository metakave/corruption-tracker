
import { PrismaClient } from '@prisma/client'
import { processArticle } from '../lib/event-processor'

const prisma = new PrismaClient()

async function main() {
    const targetSources = ['Samakal', 'Ittefaq', 'News24BD']
    console.log(`🚀 Reprocessing recent articles from: ${targetSources.join(', ')}`)

    for (const source of targetSources) {
        console.log(`\n--- Processing ${source} ---`)
        // Get recent raw articles that are NOT processed (or even if processed, let's try 5 recent ones)
        // Actually, let's pick recent ones regardless of isProcessed to debug
        const articles = await prisma.rawNewsArticle.findMany({
            where: { source: source },
            orderBy: { scrapedAt: 'desc' },
            take: 10
        })

        console.log(`Found ${articles.length} recent articles for ${source}. Analyzing...`)

        for (const article of articles) {
            console.log(`Analyzing: ${article.title.substring(0, 50)}...`)
            try {
                // Mock ScrapedArticle interface
                const input = {
                    title: article.title,
                    url: article.url,
                    content: article.content, // Ensure content exists
                    time: article.publishedAt ? article.publishedAt.toISOString() : new Date().toISOString(),
                    rawTime: '', // Not needed for re-process if we have date
                    source: article.source,
                    images: []
                }

                // processArticle handles DB creation + 'isProcessed' update
                await processArticle(input)
            } catch (e) {
                console.error(`Failed to process ${article.id}:`, e)
            }
        }
    }
}

main()
    .finally(() => prisma.$disconnect())
