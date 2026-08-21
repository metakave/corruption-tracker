
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Titles extracted from user input
const TITLES = [
    "ঢাকা কারওয়ান বাজারে মোবাইল ব্যবসায়ীদের কর্মসূচিতে পুলিশের লাঠিপেটা",
    "ঢাকা তেজগাঁও কলেজের শিক্ষার্থীর হত্যার প্রতিবাদে ফার্মগেটে সড়ক অবরোধ",
    "মুঠোফোন ব্যবসায়ীদের আন্দোলনে পুলিশের কাঁদানে গ্যাস নিক্ষেপ",
    "শরীয়তপুরে খোকন চন্দ্র দাস হত্যা: তিন আসামি গ্রেপ্তার",
    "ভালুকায় ধর্ম অবমাননার অভিযোগে পোশাকশ্রমিক দীপু দাসকে পিটিয়ে হত্যা",
    "কাঠের বোটে মালয়েশিয়া যাত্রাকালে ২০৩ জন উদ্ধার",
    "দিনাজপুরের বোচাগঞ্জে চাঁদাবাজির অভিযোগে বাড়িতে হামলা",
    "বসুন্ধরায় মব পিটুনিতে আইনজীবী হত্যা, প্রধান আসামি গ্রেপ্তার",
    "শিক্ষার্থীদের অবরোধ-বিক্ষোভে ঢাকায় পুলিশ-আন্দোলনকারীদের সংঘর্ষ",
    "রাঙামাটিতে শিক্ষার্থীদের অবরোধকালে শিক্ষকের বিরুদ্ধে অভিভাবকের ফোন ভাঙার অভিযোগ",
    "সুন্দরবনে বনদস্যুদের হাতে অপহৃত ৩ জনকে উদ্ধার করলো পুলিশ ও কোস্টগার্ড",
    "শরীয়তপুরের ডামুড্যায় ব্যবসায়ী খোকন চন্দ্র দাসকে ছুরিকাঘাত ও আগুনে পুড়িয়ে হত্যা",
    "রাজশাহীতে বাড়িতে ঢুকে যুবককে গুলি করে হত্যা",
    "টেকনাফে যুবদল-পুলিশ সংঘর্ষ, ৭ আহত, ৫ আটক", // Fixed spelling 'যুবো' -> 'যুবদল' might be needed, searching fuzzy
    "রাজ্য প্রতিষ্ঠানে হামলার ঘটনা, ফয়েজ আহমদ তৈয়্যবের নিন্দা",
    "গভীর সমুদ্রে ডাকাতের কবলে পড়া ১৩ জেলে উদ্ধার",
    "শাহবাগ মোড়ে বিক্ষোভকারীদের সড়ক অবরোধ ও অগ্নিসংযোগ",
    "রাজধানীর গুলিস্থানে বিএনপি-পুলিশ সংঘর্ষ, আহত ৫", // Spelling Gulistan
    "রাজধানীতে ককটেল হামলায় আহত ২, পুলিশ আটক করেছে ১ জনকে",
    "যশোরে মাথায় গুলি করে বিএনপি নেতাকে হত্যা",
    "চাঁদার দাবি আমলে নেননি চট্টগ্রামের শীর্ষ ব্যবসায়ী, বাড়ি লক্ষ্য করে মাস্ক পরা সন্ত্রাসীদের গুলি",
    "ভাইয়ের দাবি অনুসরণ করা হচ্ছিল নাঈমকে, হত্যা করা হয় ‘মব’ তৈরি করে",
    "নাটোর-নওগাঁ মহাসড়কে অগ্নিসংযোগ, ককটেল-পেট্রোল বোমা উদ্ধার",
    "বিটিআরসি ভবন ভাঙচুর: ৪৫ আসামি কারাগারে",
    "ভৈরবে পুলিশের হাত থেকে সাবেক কাউন্সিলরকে ছিনিয়ে নিতে হামলা",
    "যুবদল কর্মীর কাছে চাঁদা চাইতে গিয়ে পিটুনি খেলেন বিএনপির কর্মী",
    "নীলফামারীতে বুড়ি তিস্তা খননে উত্তেজনা, আনসার ক্যাম্প ভাঙচুর",
    "ওয়ার্কার্স পার্টির কার্যালয় ভাঙচুর করলেন যুবলীগ নেতার ছেলে",
    "খালেদা জিয়াকে নিয়ে আপত্তিকর মন্তব্য, চুনারুঘাটে ‘চিতল মুখলিছ’কে গণপিটুনি",
    "নরসিংদীতে বাড়ি থেকে ডেকে নিয়ে ছাত্রদল কর্মীকে হত্যা",
    "ভোটারকে বল প্রয়োগে একজনের দুই মাসের কারাদণ্ড",
    "যশোরে যুবদল-ছাত্রলীগের সংঘর্ষে গুলিবর্ষণ, আহত ৫",
    "লক্ষ্মীপুরে যুবলীগ-ছাত্রদল সংঘর্ষে আহত ৩",
    "রাউজানে যুবদল কর্মীকে পেটানোর পর ‘ফাঁকা গুলি করে’ পালাল দুর্বৃত্তরা",
    "ফেনীতে ছাত্রদল-পুলিশ সংঘর্ষ, ১ আহত, কয়েকটি ককটেল বিস্ফোরণ",
    "নওগাঁয় বিএনপি-পুলিশ সংঘর্ষ, ৪ আহত"
]

const ALLOWED_SOURCES = [
    "prothomalo.com",
    "jugantor.com",
    "ajkerpatrika.com", // Check actual domain
    "samakal.com",
    "dhakapost.com"
]

async function main() {
    console.log("🔍 Searching for Correct Source Links...\n")

    for (const title of TITLES) {
        // Strip punctuation and take significant part for search
        // Taking first 15-20 chars is risky if common prefix like "Dhaka..."
        // Better: strict containment search of a decent chunk

        const searchPhrase = title.substring(0, 15) // Try a smaller chunk to catch variations?
        // Actually, let's search for matches in `content` field.

        const matches = await prisma.rawNewsArticle.findMany({
            where: {
                content: {
                    contains: searchPhrase
                },
                scrapedAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            },
            take: 10
        })

        // Filter and Deduplicate by URL
        const validUrls = new Set<string>()

        for (const m of matches) {
            const isAllowed = ALLOWED_SOURCES.some(src => m.url.includes(src))
            if (isAllowed) {
                // Secondary check: does matched content heavily overlap with title?
                if (m.content.includes(title.substring(0, 30))) { // Stricter check
                    validUrls.add(m.url)
                }
            }
        }

        if (validUrls.size > 0) {
            console.log(`Event: ${title}`)
            validUrls.forEach(url => console.log(url))
            console.log("") // Empty line separator
        } else {
            // console.log(`# No Match: ${title}`)
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
