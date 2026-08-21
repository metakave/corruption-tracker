const { analyzeWithAI } = require('../lib/ai-analysis')
const { config } = require('dotenv')
config()

async function main() {
    console.log("🧪 Testing AI Analysis Logic Directly (CJS)...")

    const articleText = `
    বাকৃবিতে মধ্যরাতে শিক্ষার্থীদের ওপর স্থানীয়দের হামলা, আহত ৫
    বাংলাদেশ কৃষি বিশ্ববিদ্যালয়ে (বাকৃবি) মধ্যরাতে শিক্ষার্থীদের ওপর স্থানীয়রা হামলা চালিয়েছে বলে অভিযোগ উঠেছে। 
    বৃহস্পতিবার (২ জানুয়ারি) রাত ১২টার দিকে বিশ্ববিদ্যালয়ের কে.আর. মার্কেট এলাকায় এ ঘটনা ঘটে। 
    এতে অন্তত ৫ জন শিক্ষার্থী আহত হয়েছেন। আহতদের ময়মনসিংহ মেডিকেল কলেজ হাসপাতালে ভর্তি করা হয়েছে।
    প্রত্যক্ষদর্শীরা জানান, তুচ্ছ ঘটনাকে কেন্দ্র করে স্থানীয় কয়েকজন যুবক শিক্ষার্থীদের ওপর লাঠিসোঁটা নিয়ে হামলা চালায়।
    `
    const title = "বাকৃবিতে মধ্যরাতে শিক্ষার্থীদের ওপর স্থানীয়দের হামলা, আহত ৫"
    const url = "https://www.dhakapost.com/campus/420935"
    const publishedAt = "2026-01-02T18:00:00Z"
    const sourceName = "Dhaka Post"

    console.log("📤 Sending payload to Gemini...")
    try {
        const result = await analyzeWithAI(articleText, title, url, publishedAt, sourceName)

        console.log("\n📥 AI Response Recieved:")
        console.log("--------------------------------------------------")
        console.log(JSON.stringify(result, null, 2))
        console.log("--------------------------------------------------")

        if (result && result.is_political_violence) {
            console.log("✅ Classification: VIOLENCE DETECTED")
        } else {
            console.log("❌ Classification: NOT VIOLENCE (or Strict Filtering)")
        }

    } catch (error) {
        console.error("💥 Error:", error)
    }
}

main()
