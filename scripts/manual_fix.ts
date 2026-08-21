
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixData() {
    console.log("🚀 Starting Manual Data Fix...")

    // 1. FIX MYMENSINGH LOCATION
    console.log("\n📍 Fixing Gafargaon/Mymensingh Event...")
    const gafargaonEvents = await prisma.politicalEvent.findMany({
        where: {
            title: {
                contains: 'গফরগাঁওয়ে'
            }
        }
    })

    for (const event of gafargaonEvents) {
        console.log(`   Found: ${event.title} (${event.district})`)
        await prisma.politicalEvent.update({
            where: { id: event.id },
            data: {
                district: 'Mymensingh',
                locationText: 'Gafargaon, Mymensingh',
                latitude: 24.7471,
                longitude: 90.4203
            }
        })
        console.log(`   ✅ Updated to Mymensingh (24.7471, 90.4203)`)
    }

    // 2. MERGE DUPLICATES (JNU)
    console.log("\n🔗 Merging JnU Duplicates...")
    const jnuEvents = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'জকসু নির্বাচন স্থগিতের খবরে' } },
                { title: { contains: 'তিন ঘণ্টা ধরে অবরুদ্ধ উপাচার্য' } }
            ]
        },
        orderBy: { publishedAt: 'asc' }
    })

    if (jnuEvents.length > 1) {
        const primary = jnuEvents[0]
        const duplicates = jnuEvents.slice(1)

        console.log(`   Keep: ${primary.title} (ID: ${primary.id})`)

        for (const dup of duplicates) {
            console.log(`   DELETE: ${dup.title} (ID: ${dup.id})`)
            await prisma.politicalEvent.delete({
                where: { id: dup.id }
            })
        }
        console.log(`   ✅ Merged ${duplicates.length} duplicates into primary event.`)
    } else {
        console.log("   ⚠️  No duplicates found for JnU events.")
    }

    console.log("\n✅ Manual Fixes Complete!")
}

fixData()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
