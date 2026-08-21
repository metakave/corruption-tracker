const { PrismaClient } = require('@prisma/client')
const { processArticle } = require('../lib/event-processor')

const prisma = new PrismaClient()

async function main() {
    const targetUrl = 'https://www.dhakapost.com/campus/420935'
    console.log(`🧪 Verifying AI Analysis on target: ${targetUrl}`)

    // 1. Get raw article from DB
    const raw = await prisma.rawNewsArticle.findUnique({
        where: { url: targetUrl }
    })

    if (!raw) {
        console.error("❌ Raw article not found!")
        return
    }

    console.log(`📄 Found raw article: ${raw.title}`)

    // 2. Construct ScrapedArticle object (mocking what scraper would provide)
    const article = {
        title: raw.title,
        url: raw.url,
        content: raw.content || '',
        rawTime: raw.publishedAt ? raw.publishedAt.toISOString() : new Date().toISOString(),
        time: raw.publishedAt ? raw.publishedAt.toISOString() : new Date().toISOString(),
        source: raw.source,
        images: []
    }

    // 3. Run Processor with forceUpdate = true
    console.log("🚀 Starting processArticle with FORCE UPDATE...")
    try {
        const result = await processArticle(article, true)

        if (result) {
            console.log("✅ Processor returned TRUE (Violence Detected / Updated)")

            // 4. Verify the stored event
            const event = await prisma.politicalEvent.findFirst({
                where: { url: targetUrl }
            })

            if (event) {
                console.log("🎉 VERIFICATION SUCCESS!")
                console.log("--------------------------------------------------")
                console.log(`Title: ${event.title}`)
                console.log(`Date: ${event.dateOfIncident.toISOString().split('T')[0]}`)
                console.log(`Severity: ${event.severityScore}`)
                console.log(`Confidence: ${event.confidence}`)
                console.log("--------------------------------------------------")
            } else {
                console.error("❌ Event not found in DB after processing!")
            }

        } else {
            console.log("⚠️ Processor returned FALSE (Not Violence or Skipped)")
        }
    } catch (e) {
        console.error("💥 Error during processing:", e)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
