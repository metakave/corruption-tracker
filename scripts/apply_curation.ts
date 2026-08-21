
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🛠 APPLYING MANUAL CURATION")

    // 1. CLEAN NAIM EVENT
    const NAIM_ID = '25c8dfd4-1bfc-4c3f-bfc6-f0c68a745e45'
    console.log(`\n1. Cleaning Naim Event (${NAIM_ID})...`)
    const naimEvent = await prisma.politicalEvent.findUnique({ where: { id: NAIM_ID } })

    if (naimEvent && naimEvent.additionalSources) {
        const removeList = [
            'xix2htthxk', 'l34es0dtdg', 'wdn6fguboj', '421482'
        ]

        const sources = JSON.parse(naimEvent.additionalSources)
        const keptSources = sources.filter((s: any) => !removeList.some(r => s.url.includes(r)))

        console.log(`   Sources: ${sources.length} -> ${keptSources.length}`)

        await prisma.politicalEvent.update({
            where: { id: NAIM_ID },
            data: { additionalSources: JSON.stringify(keptSources) }
        })
        console.log("   ✅ Naim Event Cleaned.")
    }

    // 2. UPDATE BTRC EVENT
    const BTRC_ID = '18fbed5b-6f17-4da1-a20c-cdee16bc5b06' // Assumed from inspection order (checking title safety)
    console.log(`\n2. Updating BTRC Event (${BTRC_ID})...`)
    const btrcEvent = await prisma.politicalEvent.findUnique({ where: { id: BTRC_ID } })

    if (btrcEvent) {
        if (!btrcEvent.title.includes('বিটিআরসি') && !btrcEvent.title.includes('BTRC')) {
            console.warn("   ⚠️ WARNING: ID ID mismatch? Title is: " + btrcEvent.title)
        }

        const newSource = {
            url: 'https://www.dhakapost.com/national/421482',
            source: 'Dhaka Post',
            title: 'Moved from Naim Event'
        }

        let currentSources = btrcEvent.additionalSources ? JSON.parse(btrcEvent.additionalSources) : []
        // Avoid dupe
        if (!currentSources.find((s: any) => s.url === newSource.url)) {
            currentSources.push(newSource)
            await prisma.politicalEvent.update({
                where: { id: BTRC_ID },
                data: { additionalSources: JSON.stringify(currentSources) }
            })
            console.log("   ✅ Added Dhaka Post link to BTRC Event.")
        } else {
            console.log("   ℹ️ Link already exists in BTRC Event.")
        }
    }

    // 3. CREATE NEW EVENT (Shahbagh)
    console.log("\n3. Creating New Event (Shahbagh Blockade)...")
    const newMainUrl = 'https://www.prothomalo.com/bangladesh/capital/wdn6fguboj'
    const newSecondUrl = 'https://www.prothomalo.com/bangladesh/capital/l34es0dtdg'
    const newTitle = '‘বানিয়াচং থানা কিন্তু আমরা পুড়িয়ে দিয়েছিলাম’ বলা সেই নেতার মুক্তির দাবিতে শাহবাগ অবরোধ'

    // Check if exists
    const exists = await prisma.politicalEvent.findUnique({ where: { url: newMainUrl } })
    if (!exists) {
        await prisma.politicalEvent.create({
            data: {
                title: newTitle,
                url: newMainUrl,
                source: 'Prothom Alo',
                publishedAt: new Date(), // Use now or fetch from raw if needed, but 'now' places it at top of feed which is good
                dateOfIncident: new Date(),
                locationText: 'Shahbagh, Dhaka',
                district: 'Dhaka',
                latitude: 23.734,
                longitude: 90.3928,
                politicalParties: JSON.stringify(['Anti-Discrimination Student Movement']),
                summary: 'Protestors blocked Shahbagh demanding the release of a leader.',
                severityScore: 4,
                confidence: 0.9,
                tags: JSON.stringify(['Protest', 'Blockade']),
                additionalSources: JSON.stringify([{ url: newSecondUrl, source: 'Prothom Alo', title: 'Start of Protest' }]),
                isBangladesh: true,
                isPoliticalViolence: true,
                killed: 0,
                injured: 0
            }
        })
        console.log("   ✅ Created new Shahbagh Event.")
    } else {
        console.log("   ℹ️ Shahbagh Event already exists.")
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
