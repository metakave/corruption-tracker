
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Starting Data Integrity Audit (Mismatch Check)...")

    // Configuration
    const VIOLENCE_KEYWORDS = ["হত্যা", "খুন", "হামলা", "সংঘর্ষ", "আহত", "নিহত", "গ্রেপ্তার", "আগুন", "ককটেল", "বিস্ফোরণ"]
    const IRRELEVANT_KEYWORDS = [
        "টস", "উইকেট", "ব্যাটিং", "বোলিং", "ক্রিকেট", "বিপিএল", "BPL",
        "ফুটবল", "গোল",
        "বিনোদন", "মুক্তি পেয়েছে", "সিনেমা", "নাটক"
    ]

    console.log("   Violence Keywords:", VIOLENCE_KEYWORDS)
    console.log("   Irrelevant Keywords:", IRRELEVANT_KEYWORDS)

    // Fetch confirmed violence events (or all events if we suspect misclassifications passed through)
    // We check all 'PoliticalEvent' entries.
    const events = await prisma.politicalEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200 // Check last 200 for now to be fast
    })

    console.log(`📊 Checking last ${events.length} events...`)

    let mismatchCount = 0

    for (const event of events) {
        // 1. Check Title for Violence Context
        const titleLower = event.title.toLowerCase()
        const hasViolenceKeyword = VIOLENCE_KEYWORDS.some(k => titleLower.includes(k))

        if (!hasViolenceKeyword) {
            // If title doesn't look violent, maybe it's less critical, but let's stick to the mismatched logic.
            // Actually, if it IS in PoliticalEvent, it SHOULD be violent.
        }

        // 2. Fetch Content
        // Try RawNewsArticle first
        let content = ""
        const rawArticle = await prisma.rawNewsArticle.findUnique({
            where: { url: event.url }
        })

        if (rawArticle) {
            content = rawArticle.content
        } else {
            content = event.rawText || ""
        }

        if (!content || content.length < 50) {
            // console.log(`   ⚠️ Content empty/short for ID ${event.id}. Skipping match check.`)
            continue
        }

        // 3. Check Content for Irrelevance
        const contentLower = content.toLowerCase()
        const matchedIrrelevant = IRRELEVANT_KEYWORDS.filter(k => contentLower.includes(k))

        // If it has > 2 irrelevant keywords, it's highly suspicious (to avoid accidental single word matches)
        if (matchedIrrelevant.length >= 2) {
            console.log(`\n🔴 SUSPICIOUS MISMATCH FOUND:`)
            console.log(`   ID: ${event.id}`)
            console.log(`   Title: ${event.title}`)
            console.log(`   URL: ${event.url}`)
            console.log(`   Violent Keywords (Title): ${VIOLENCE_KEYWORDS.filter(k => titleLower.includes(k)).join(', ')}`)
            console.log(`   Irrelevant Keywords (Content): ${matchedIrrelevant.join(', ')}`)
            console.log(`   Content Snippet: ${content.substring(0, 100).replace(/\n/g, ' ')}...`)
            mismatchCount++
        }
    }

    console.log(`\n===================================================`)
    console.log(`Audit Complete.`)
    console.log(`Total Checked: ${events.length}`)
    console.log(`Suspicious Mismatches: ${mismatchCount}`)
    console.log(`===================================================`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
