import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🧪 Verifying Corruption Tracker Database & Models...")

    // 1. Seed a sample verified corruption event
    const sampleEvent = await prisma.corruptionEvent.upsert({
        where: { url: "https://example.com/corruption-sample-1" },
        update: {},
        create: {
            title: "স্বাস্থ্য অধিদপ্তরের চিকিৎসা সরঞ্জাম কেনাকাটায় ৫০ কোটি টাকার আর্থিক অনিয়ম ও আত্মসাৎ",
            url: "https://example.com/corruption-sample-1",
            source: "প্রথম আলো",
            publishedAt: new Date(),
            locationText: "মহাখালী, ঢাকা",
            district: "Dhaka",
            latitude: 23.8103,
            longitude: 90.4125,
            accusedEntities: JSON.stringify([
                { name: "ডা. রফিকুল ইসলাম", designation: "পরিচালক (ক্রয়)", organization: "স্বাস্থ্য অধিদপ্তর" },
                { name: "মেসার্স মেডিটেক ট্রেডার্স", designation: "সরবরাহকারী প্রতিষ্ঠান", organization: "মেডিটেক" }
            ]),
            sectorOrMinistry: "স্বাস্থ্য ও পরিবার কল্যাণ",
            amountInvolved: 500000000,
            amountFormatted: "৳৫০ কোটি",
            investigatingAgency: "দুদক (ACC)",
            legalStatus: "inquiry",
            summary: "স্বাস্থ্য অধিদপ্তরের বিভিন্ন বিশেষায়িত হাসপাতালের জন্য এমআরআই ও সিটি স্ক্যান মেশিন ক্রয়ে বাজারদরের চেয়ে চারগুণ বেশি বিল পরিশোধ করে ৫০ কোটি টাকা আত্মসাতের অভিযোগে অনুসন্ধান শুরু করেছে দুর্নীতি দমন কমিশন (দুদক)।",
            severityScore: 8,
            confidence: 0.96,
            category: "Embezzlement",
            tags: JSON.stringify(["কেনাকাটায় দুর্নীতি", "দুদক অনুসন্ধান", "ভুয়া বিল"]),
            isBangladesh: true,
            isCorruption: true
        }
    })

    console.log("✅ Successfully created sample CorruptionEvent:", sampleEvent.id)

    // 2. Query stats
    const total = await prisma.corruptionEvent.count({ where: { isCorruption: true } })
    const lossAgg = await prisma.corruptionEvent.aggregate({
        where: { isCorruption: true },
        _sum: { amountInvolved: true }
    })

    console.log(`📊 Verified Database Stats:`)
    console.log(`   - Total Corruption Events: ${total}`)
    console.log(`   - Total Tracked Loss: ৳${((lossAgg._sum.amountInvolved || 0) / 10000000).toFixed(1)} কোটি`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
