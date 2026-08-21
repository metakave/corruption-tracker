import { analyzeWithAI, checkDuplicateWithAI } from '../lib/ai-analysis'
import { callOpenRouter } from '../lib/openrouter'
import dotenv from 'dotenv'

dotenv.config()

async function runTest() {
    console.log('🔍 Testing OpenRouter Connection & Corruption Scanning System...\n')

    // 1. Connection Test
    console.log('--- Step 1: OpenRouter Connection Test ---')
    try {
        const ping = await callOpenRouter([
            { role: 'user', content: 'Respond with JSON: {"status": "connected", "platform": "OpenRouter"}' }
        ], { responseFormatJson: true, temperature: 0.1 })
        console.log('✅ OpenRouter Response:', ping)
    } catch (e: any) {
        console.error('❌ OpenRouter connection failed:', e.message)
        return
    }

    // 2. Test Corruption Case Scanning & Classification
    console.log('\n--- Step 2: Scanning & Classifying News with Llama 3.3 70B ---')

    const testArticles = [
        {
            title: 'রাজধানীতে স্বাস্থ্যের সাবেক পরিচালকের ৫০ কোটি টাকার অবৈধ সম্পদ জব্দের আদেশ',
            source: 'দৈনিক প্রথম আলো',
            url: 'https://example.com/news/corruption-health-50crore',
            publishedAt: '2026-08-22',
            text: `স্বাস্থ্য অধিদপ্তরের সাবেক এক পরিচালকের নামে-বেনামে থাকা প্রায় ৫০ কোটি টাকার স্থাবর ও অস্থাবর সম্পদ ক্রোক ও ব্যাংক হিসাব ফ্রিজ করার নির্দেশ দিয়েছেন আদালত। 
            দুর্নীতি দমন কমিশনের (দুদক) আবেদনের পরিপ্রেক্ষিতে ঢাকার মহানগর জ্যেষ্ঠ বিশেষ জজ এই আদেশ দেন। 
            দুদকের অনুসন্ধানে জানা গেছে, স্বাস্থ্য খাতের যন্ত্রপাতি ও ওষুধ কেনাকাটায় ভুয়া বিল ও টেন্ডার কারচুপির মাধ্যমে তিনি জ্ঞাত আয়বহির্ভূত বিপুল পরিমাণ অর্থ আত্মসাৎ করেছেন। 
            অভিযুক্ত কর্মকর্তার বিরুদ্ধে মানিলন্ডারিং প্রতিরোধ আইনে মামলার প্রস্তুতি চলছে।`
        },
        {
            title: 'ব্যাংক থেকে জাল সনদে ১৮০ কোটি টাকার ঋণ জালিয়াতি, এমডিসহ গ্রেফতার ৩',
            source: 'যুগান্তর',
            url: 'https://example.com/news/bank-loan-fraud-180cr',
            publishedAt: '2026-08-22',
            text: `চট্টগ্রামের একটি বেসরকারি ব্যাংক থেকে জাল নথিপত্র ব্যবহার করে ১৮০ কোটি টাকা ভুয়া ঋণ নিয়ে আত্মসাতের অভিযোগে একটি ব্যবসায়ী গ্রুপের এমডিসহ তিনজনকে গ্রেফতার করেছে সিআইডি। 
            অনুসন্ধানে জানা গেছে, কাগুজে প্রতিষ্ঠানের নামে ঋণ অনুমোদন করিয়ে সেই অর্থ বিভিন্ন অ্যাকাউন্টে স্থানান্তর ও হুন্ডির মাধ্যমে বিদেশে পাচার করা হয়েছিল।`
        },
        {
            title: 'মিরপুর স্টেডিয়ামে তীব্র গরমে অনুশীলন করলেন জাতীয় ক্রিকেট দল',
            source: 'সমকাল',
            url: 'https://example.com/news/sports-cricket-practice',
            publishedAt: '2026-08-22',
            text: `মিরপুর শেরেবাংলা জাতীয় ক্রিকেট স্টেডিয়ামে আসন্ন ত্রিদেশীয় সিরিজের জন্য আজ সকাল থেকে ঘাম ঝরিয়েছেন জাতীয় দলের ক্রিকেটাররা। ব্যাটিং ও ফিল্ডিং সেশনে কোচ খেলোয়াড়দের ফিটনেসের ওপর জোর দেন।`
        }
    ]

    for (let i = 0; i < testArticles.length; i++) {
        const article = testArticles[i]
        console.log(`\n[Article ${i + 1}] "${article.title}" (${article.source})`)
        const result = await analyzeWithAI(
            article.text,
            article.title,
            article.url,
            article.publishedAt,
            article.source
        )

        if (!result) {
            console.log('   ❌ AI Analysis returned null')
            continue
        }

        console.log(`   Is Corruption: ${result.is_corruption ? '✅ YES (CORRUPTION DETECTED)' : '⚪ NO (FILTERED OUT)'}`)
        if (result.is_corruption) {
            console.log(`   Category: ${result.category}`)
            console.log(`   Estimated Amount: ${result.financial_impact.amount_formatted} (Crores: ${result.financial_impact.amount_crores})`)
            console.log(`   Sector / Ministry: ${result.sector_or_ministry}`)
            console.log(`   Investigating Agency: ${result.investigating_agency}`)
            console.log(`   Legal Status: ${result.legal_status}`)
            console.log(`   District: ${result.location.district}`)
            console.log(`   Severity (1-10): ${result.severity_score}/10`)
            console.log(`   Accused Entities:`, result.accused_entities)
            console.log(`   Summary: ${result.summary}`)
        } else {
            console.log(`   Reason for exclusion: ${result.decision_trace?.reason_for_exclusion || 'Non-corruption article'}`)
        }
    }

    console.log('\n--- Step 3: Testing Deduplication Matching with AI ---')
    const isDupe = await checkDuplicateWithAI(
        'স্বাস্থ্য খাতের সাবেক পরিচালকের ৫০ কোটি টাকার সম্পদ জব্দ',
        'আদালতের নির্দেশে স্বাস্থ্যের সাবেক পরিচালকের ৫০ কোটি টাকার ব্যাংক হিসাব ফ্রিজ ও সম্পদ ক্রোক করা হয়েছে।',
        'রাজধানীতে স্বাস্থ্যের সাবেক পরিচালকের ৫০ কোটি টাকার অবৈধ সম্পদ জব্দের আদেশ',
        'দুদকের আবেদনের পরিপ্রেক্ষিতে স্বাস্থ্য অধিদপ্তরের সাবেক পরিচালকের ৫০ কোটি টাকার সম্পদ ক্রোকের আদেশ দেন আদালত।'
    )
    console.log(`   Deduplication Match Result: ${isDupe ? '✅ Correctly identified as DUPLICATE' : '❌ Failed to match duplicate'}`)

    console.log('\n🎉 Test Completed Successfully!')
}

runTest()
