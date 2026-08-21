
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🛠 APPLYING MANUAL CURATION V3 (Robust)")

    // 1. CLEAN NAIM EVENT (Find by partial title)
    console.log("\n1. Finding & Cleaning Naim Event...")
    const naimEvent = await prisma.politicalEvent.findFirst({
        where: { title: { contains: 'অনুসরণ করা হচ্ছিল' } }
    })

    if (naimEvent) {
        console.log(`   Found: ${naimEvent.title} (${naimEvent.id})`)
        if (naimEvent.additionalSources) {
            const removeList = [
                'xix2htthxk', 'l34es0dtdg', 'wdn6fguboj', '421482'
            ]

            const sources = JSON.parse(naimEvent.additionalSources)
            const initialCount = sources.length
            const keptSources = sources.filter((s: any) => !removeList.some(r => s.url.includes(r)))

            console.log(`   Sources: ${initialCount} -> ${keptSources.length}`)

            if (initialCount !== keptSources.length) {
                await prisma.politicalEvent.update({
                    where: { id: naimEvent.id },
                    data: { additionalSources: JSON.stringify(keptSources) }
                })
                console.log("   ✅ Naim Event Updated.")
            } else {
                console.log("   ℹ️ No matching sources to remove (already clean?).")
            }
        }
    } else {
        console.log("   ❌ Naim Event NOT FOUND by title search.")
    }

    // 2. UPDATE BTRC EVENT
    console.log("\n2. Updating BTRC Event...")
    const btrcEvent = await prisma.politicalEvent.findFirst({
        where: {
            OR: [
                { title: { contains: 'বিটিআরসি' } },
                { title: { contains: 'BTRC' } }
            ]
        }
    })

    if (btrcEvent) {
        console.log(`   Found: ${btrcEvent.title} (${btrcEvent.id})`)
        const newSource = {
            url: 'https://www.dhakapost.com/national/421482',
            source: 'Dhaka Post',
            title: 'বিটিআরসি ভবন ভাঙচুর: ৪৫ আসামি কারাগারে'
        }

        // Parse existing, default to empty array
        let currentSources = []
        try {
            currentSources = btrcEvent.additionalSources ? JSON.parse(btrcEvent.additionalSources) : []
        } catch (e) { currentSources = [] }

        // Check dedupe
        if (!currentSources.find((s: any) => s.url === newSource.url)) {
            currentSources.push(newSource)
            await prisma.politicalEvent.update({
                where: { id: btrcEvent.id },
                data: { additionalSources: JSON.stringify(currentSources) }
            })
            console.log("   ✅ Added Dhaka Post link to BTRC Event.")
        } else {
            console.log("   ℹ️ Link already exists in BTRC Event.")
        }
    } else {
        // Create BTRC Event if not found (interpret 'new row' strictly)
        console.log("   ⚠️ BTRC Event not found. Creating it...")
        await prisma.politicalEvent.create({
            data: {
                title: 'বিটিআরসি ভবন ভাঙচুর: ৪৫ আসামি কারাগারে',
                url: 'https://www.dhakapost.com/national/421482',
                source: 'Dhaka Post',
                publishedAt: new Date(),
                summary: 'Attack on BTRC building, 45 accused sent to jail.',
                locationText: 'Dhaka',
                severityScore: 3,

            }
        })
        console.log("   ✅ Created new BTRC Event (Fallback).")
    }

    // 3. CHECK SHAHBAGH (Verification only)
    const shahbagh = await prisma.politicalEvent.findFirst({
        where: { title: { contains: 'বানিয়াচং থানা' } }
    })
    if (shahbagh) {
        console.log(`\n3. Shahbagh Event Verified: ${shahbagh.title}`)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
