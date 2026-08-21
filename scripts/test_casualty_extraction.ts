
import { analyzeWithAI } from '../lib/ai-analysis'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
    console.log("Testing AI Casualty Extraction...")

    const articleText = `
    শরীয়তপুরের ডামুড্যায় ব্যবসায়ীকে কুপিয়ে ও পুড়িয়ে হত্যা
    
    ২০২৫ সালের ৩১ ডিসেম্বর রাতে শরীয়তপুরের ডামুড্যায় দুর্বৃত্তরা খোকন চন্দ্র দাস নামে এক ওষুধ ব্যবসায়ীকে কুপিয়ে ও পেট্রোল ঢেলে পুড়িয়ে গুরুতর আহত করে। তিনদিন চিকিৎসাধীন থাকার পর ২০২৫ সালের ৩ জানুয়ারি তিনি মারা যান।
    `

    const title = "শরীয়তপুরের ডামুড্যায় ব্যবসায়ীকে কুপিয়ে ও পুড়িয়ে হত্যা"
    const url = "https://example.com/test-article"
    const publishedAt = "2026-01-07" // Future date relative to event, simulating current crawl
    const sourceName = "Test Source"

    console.log("Analyzing text...")
    const result = await analyzeWithAI(articleText, title, url, publishedAt, sourceName)

    if (result) {
        console.log("\n--- AI Result ---")
        console.log(`Title: ${result.title}`)
        console.log(`Summary: ${result.summary}`)
        console.log(`Killed: ${result.casualties.killed}`)
        console.log(`Injured: ${result.casualties.injured}`)
        console.log(`Confidence: ${result.confidence}`)

        if (result.casualties.killed === 1) {
            console.log("\n✅ PASSED: Correctly identified 1 killed.")
        } else {
            console.log(`\n❌ FAILED: Identified ${result.casualties.killed} killed. Expected 1.`)
        }
    } else {
        console.log("\n❌ FAILED: AI returned null.")
    }
}

main().catch(console.error)
