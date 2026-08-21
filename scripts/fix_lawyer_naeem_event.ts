
import { PrismaClient } from '@prisma/client'
import { analyzeWithAI } from '../lib/ai-analysis'

const prisma = new PrismaClient()

// content provided by user
const CORRECT_CONTENT = `
আইনজীবী নাঈম কিবরিয়া

সমকাল প্রতিবেদক

 প্রকাশ: ০৫ জানুয়ারি ২০২৬ | ০১:৩৪

FacebookXWhatsAppLinkedInTelegramMessengerEmailShare
-
অ
+
রাজধানীর বসুন্ধরা আবাসিক এলাকায় ‘মব’ করে আইনজীবী নাঈম কিবরিয়া হত্যা মামলার প্রধান আসামি জোবায়ের হোসেন পাপ্পুকে গ্রেপ্তার করেছে র‍্যাব-১। 

গতকাল রোববার রাজধানীর বারিধারা এলাকা থেকে তাকে গ্রেপ্তার করা হয় বলে র‍্যাব সংবাদ বিজ্ঞপ্তিতে জানায়। প্রাথমিক জিজ্ঞাসাবাদে হত্যাকাণ্ডে জড়িত থাকার কথা স্বীকার করেন আসামি জোবায়ের। 

এতে বলা হয়, আইনজীবী নাঈম কিবরিয়া গত ১৭ ডিসেম্বর নারায়ণগঞ্জের রূপগঞ্জে তার আত্মীয় রাকিবুল ইসলামের বাসায় বেড়াতে যান। ৩১ ডিসেম্বর রাত ৯টার দিকে আত্মীয়ের ব্যবসায়িক অংশীদার মোতালেব মিয়ার প্রাইভেটকার নিয়ে বসুন্ধরা আবাসিক এলাকায় ঘুরতে বের হন। এ সময় বসুন্ধরা আবাসিক এলাকায় একটি মোটরসাইকেলে ধাক্কা লাগাকে কেন্দ্র করে তর্ক-বির্তক হয়। এ সময় অন্য মোটরসাইকেলে থাকা কিছু লোক নাঈমকে নামিয়ে বেধড়ক মারধর করে। রাতেই তাকে কুর্মিটোলা জেনারেল হাসপাতালে নিয়ে গেলে চিকিৎসক মৃত বলে ঘোষণা করেন। এ ঘটনায়  ভাটারা থানায় মামলা হয়।।

এদিকে নাঈম কিবরিয়া হত্যার বিচার দাবিতে মানববন্ধন করেছেন ঢাকার আইনজীবীরা। গতকাল পুরান ঢাকার ঢাকা আইনজীবী সমিতির কার্যালয়ের সামনে সচেতন আইনজীবী সমাজের ব্যানারে এ কর্মসূচি পালন করা হয়।
`

const CORRECT_URL = "https://samakal.com/capital/article/332456/%E0%A6%86%E0%A6%87%E0%A6%A8%E0%A6%9C%E0%A7%80%E0%A6%AC%E0%A7%80-%E0%A6%A8%E0%A6%BE%E0%A6%88%E0%A6%AE-%E0%A6%B9%E0%A6%A4%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%B0-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A7%E0%A6%BE%E0%A6%A8-%E0%A6%86%E0%A6%B8%E0%A6%BE%E0%A6%AE%E0%A6%BF-%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A7%87%E0%A6%AA%E0%A7%8D%E0%A6%A4%E0%A6%BE%E0%A6%B0-%E0%A6%A6%E0%A6%BE%E0%A7%9F-%E0%A6%B8%E0%A7%8D%E0%A6%AC%E0%A7%80%E0%A6%95%E0%A6%BE%E0%A6%B0%C2%A0"

async function main() {
    console.log("🛠️ Starting Repair for Lawyer Naeem Event...")

    // 1. Update RawNewsArticle Content
    // We search by ID part '332456' to be safe, or just update the one we found earlier (ID 10099 if consistent, but searching is safer)
    const rawArticle = await prisma.rawNewsArticle.findFirst({
        where: { url: { contains: '332456' } }
    })

    if (rawArticle) {
        console.log(`✅ Found Raw Article ID: ${rawArticle.id}. Updating content...`)
        await prisma.rawNewsArticle.update({
            where: { id: rawArticle.id },
            data: { content: CORRECT_CONTENT }
        })
    } else {
        console.log(`❌ Raw Article not found! Cannot update content.`)
        // Potentially create it? For now, assume it exists as verified before.
        return
    }

    // 2. Find and Update PoliticalEvent
    const event = await prisma.politicalEvent.findFirst({
        where: { title: { contains: 'আইনজীবী নাঈম হত্যার' } }
    })

    if (!event) {
        console.log(`❌ Political Event not found.`)
        return
    }

    console.log(`✅ Found Event ID: ${event.id}. Updating URL...`)
    // Update URL to the correct one so future lookups are correct
    await prisma.politicalEvent.update({
        where: { id: event.id },
        data: { url: CORRECT_URL }
    })

    // 3. Re-Analyze
    console.log(`🧠 Re-analyzing with AI...`)

    // We use the DATE from the Article Text "প্রকাশ: ০৫ জানুয়ারি ২০২৬" -> "2026-01-05" 
    // or just use current date if not parsed, but let's pass the raw string date if possible or today's.
    // The previous code passed ISO string.
    const publishedAt = "2026-01-05"

    try {
        const result = await analyzeWithAI(
            CORRECT_CONTENT,
            "আইনজীবী নাঈম হত্যার প্রধান আসামি গ্রেপ্তার, দায় স্বীকার",
            CORRECT_URL,
            publishedAt,
            "Samakal"
        )

        if (result) {
            console.log(`✅ AI Analysis Successful!`)
            console.log(`   Violence: ${result.is_political_violence}`)
            console.log(`   Type: ${result.incident_type}`)
            console.log(`   Severity: ${result.severity_score}`)
            console.log(`   Summary: ${result.summary}`)

            // Update the Event
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    isPoliticalViolence: result.is_political_violence,
                    title: result.title,
                    summary: result.summary,
                    // incidentType was incorrect in Prisma Schema, it is likely stored in tags or not at all. 
                    // Storing in tags as array
                    tags: JSON.stringify([result.incident_type]),
                    severityScore: result.severity_score,
                    confidence: result.confidence,
                    locationText: result.location.spot,
                    district: result.location.district,
                    injured: result.casualties.injured,
                    killed: result.casualties.killed,
                    updatedAt: new Date()
                    // details field removed as it does not exist in schema
                }
            })
            console.log(`🎉 Event Updated Successfully!`)

        } else {
            console.log(`❌ AI returned null.`)
        }

    } catch (e) {
        console.error(`💥 AI Error:`, e)
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
