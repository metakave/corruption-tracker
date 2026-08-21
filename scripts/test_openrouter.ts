import dotenv from 'dotenv'
import { callOpenRouter } from '../lib/openrouter'
import { analyzeWithAI } from '../lib/ai-analysis'

dotenv.config()

async function testOpenRouter() {
    console.log("🧪 Testing OpenRouter API Integration...")
    console.log(`   API Key configured: ${process.env.OPENROUTER_API_KEY ? 'YES (length: ' + process.env.OPENROUTER_API_KEY.length + ')' : 'NO'}`)
    console.log(`   Primary Model: ${process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash'}`)

    if (!process.env.OPENROUTER_API_KEY) {
        console.error("❌ Please set OPENROUTER_API_KEY in your .env file first.")
        process.exit(1)
    }

    // 1. Basic Connection Test
    try {
        console.log("\n[Test 1] Simple Handshake...")
        const response = await callOpenRouter([
            { role: "user", content: "Reply with the exact word 'OPENROUTER_CONNECTED' if you can read this." }
        ])
        console.log(`   Response: "${response.trim()}"`)
        console.log("   ✅ Handshake Successful!")
    } catch (err: any) {
        console.error("   ❌ Handshake Failed:", err.message)
        process.exit(1)
    }

    // 2. Structured JSON News Analysis Test
    try {
        console.log("\n[Test 2] Testing Bengali News Intelligence Extraction (JSON Mode)...")
        const sampleArticle = `
মিরপুরে রাজনৈতিক সংঘর্ষে নিহত ১, আহত অন্তত ১৫

রাজধানীর মিরপুর ১০ নম্বর গোলচত্বরে গতকাল বিকেলে দুই রাজনৈতিক পক্ষের মধ্যে ব্যাপক ধাওয়া-পাল্টাধাওয়া ও ককটেল বিস্ফোরণের ঘটনা ঘটেছে। এতে মো. হাসান (২৮) নামে এক যুবক নিহত হয়েছেন। স্থানীয় সূত্র জানায়, সংঘর্ষ চলাকালে বেশ কয়েকটি দোকানপাট ভাঙচুর ও মোটরসাইকেলে আগুন দেওয়া হয়। আহতদের উদ্ধার করে স্থানীয় হাসপাতালে ভর্তি করা হয়েছে। পুলিশ ঘটনাস্থলে পৌঁছে টিয়ারশেল নিক্ষেপ করে পরিস্থিতি নিয়ন্ত্রণে আনে।
`
        const result = await analyzeWithAI(
            sampleArticle,
            "মিরপুরে রাজনৈতিক সংঘর্ষে নিহত ১, আহত অন্তত ১৫",
            "https://example.com/test-news-mirpur",
            "2026-08-22",
            "প্রথম আলো"
        )

        console.log("   📊 Extraction Result:")
        console.log("   - Is Political Violence:", result?.is_political_violence)
        console.log("   - Category:", result?.category)
        console.log("   - District:", result?.location?.district)
        console.log("   - Casualties: Killed =", result?.casualties?.killed, ", Injured =", result?.casualties?.injured)
        console.log("   - Severity:", result?.severity_score)
        console.log("   - Summary:", result?.summary)
        console.log("\n🎉 All OpenRouter Tests Passed Successfully!")
    } catch (err: any) {
        console.error("   ❌ News Extraction Test Failed:", err.message)
    }
}

testOpenRouter()
