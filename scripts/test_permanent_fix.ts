
import { analyzeWithAI } from '../lib/ai-analysis'

async function main() {
    console.log("🚀 Testing Permanent Year Enforcement...")

    // Fake 2026 Article with 2024 Text (Safe content to avoid filters)
    const fakeRawText = "আজ সোমবার (৫ জানুয়ারি) ঢাকায় একটি রাজনৈতিক মিছিল অনুষ্ঠিত হয়েছে। মিছিলে অংশগ্রহণকারীরা ২০২৪ সালের ৫ জানুয়ারি নির্বাচনের দাবি জানান。"
    const fakePublishedAt = "2026-01-06"

    // Mock API call? No, let's run real one to see if POST-PROCESSING catches it.
    // If AI returns "2024", our code should flip it to "2026".

    // Actually, I can't easily mock the AI response here without mocking fetch.
    // But I can rely on the fact that if I run this, the AI *might* halluncinate 2024 (as per user report),
    // and my code *must* correct it.

    const result = await analyzeWithAI(
        fakeRawText,
        "Test Title: Dhaka Rally",
        "http://test.com",
        fakePublishedAt,
        "Test Source"
    )

    if (result) {
        console.log("\n✅ Result Summary:", result.summary)
        console.log("✅ Result Date:", result.incident_date)

        if (result.summary && result.summary.includes("২০২৬") && !result.summary.includes("২০২৪")) {
            console.log("🎉 SUCCESS: Summary Year Enforced to 2026")
        } else if (result.summary) {
            console.log("❌ FAILURE: Summary still contains wrong year or wasn't updated")
        } else {
            console.log("⚠️ WARNING: Summary is null")
        }

        if (result.incident_date.startsWith("2026")) {
            console.log("🎉 SUCCESS: Incident Date Enforced to 2026")
        } else {
            console.log("❌ FAILURE: Incident Date is wrong")
        }

    } else {
        console.log("❌ AI Failed to generate result")
    }
}

main().catch(console.error)
