import { PrismaClient } from '@prisma/client'
import { analyzeWithAI } from '../lib/ai-analysis'
import { processArticle } from '../lib/event-processor'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 STARTING DEBUG SCRIPT")

    // 1. Fetch a "suspicious" article that might be violence but wasn't flagged or just needs checking
    const article = await prisma.rawNewsArticle.findFirst({
        where: {
            content: {
                contains: 'সংঘর্ষ', // Clash
                mode: 'insensitive'
            }
        },
        orderBy: { scrapedAt: 'desc' },
        take: 1
    })

    if (!article) {
        console.log("❌ No raw articles found to debug.")
        return
    }

    console.log(`📝 Testing Article: "${article.title}"`)
    console.log(`🔗 URL: ${article.url}`)
    console.log(`📄 Content Length: ${article.content?.length}`)

    if (!article.content || article.content.length < 50) {
        console.log("⚠️ Content too short. Trying to fetch content manually...")
        // We can't easily re-run puppeteer here without duplicating logic or importing processArticle but bypassing DB checks.
        // Let's just try to run analyzeWithAI directly on what we have.
    }

    console.log("\n🤖 CALLING AI (analyzeWithAI)...")
    try {
        const result = await analyzeWithAI(article.content || "Test content", article.title, article.url, new Date().toISOString())
        console.log("✅ AI RESULT:", JSON.stringify(result, null, 2))
    } catch (e: any) {
        console.error("❌ AI ERROR:", e)
        if (e.message) console.error("Message:", e.message)
        if (e.cause) console.error("Cause:", e.cause)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
