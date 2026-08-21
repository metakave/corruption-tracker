
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- FIXING MAP & MERGING DUPLICATES ---')

    // 1. Fix Kurigram Event
    console.log('\n🔧 FIXING MISPLACED KURIGRAM EVENT...')
    const kurigramId = '022ec0b5-aafd-436d-9c09-9ef410d444ba' // From inspection
    try {
        await prisma.politicalEvent.update({
            where: { id: kurigramId },
            data: {
                district: 'কুড়িগ্রাম', // Ensure District is set
                // Kurigram Coords: 25.8072, 89.6297
                latitude: 25.8072,
                longitude: 89.6297,
                locationText: 'কুড়িগ্রাম (Curated)'
            }
        })
        console.log(`   ✅ Fixed Kurigram Event Location`)
    } catch (e) {
        console.error(`   ❌ Failed to fix Kurigram event: ${e.message}`)
    }

    // 2. Merge Mobile Clash Duplicates
    console.log('\n🔗 MERGING MOBILE CLASH DUPLICATES...')
    // IDs from inspection
    const mobileIds = [
        'aa30ab9b-c2c5-4f0c-b529-6fd141481468',
        'caaa173e-c0ac-4a74-9d45-2578e7b9d79b',
        'aff14387-9787-4ed1-9663-0625f950a1bf',
        'f74f4ef1-febc-4a51-b51d-129c6c2cf1e6',
        '65a9687e-df1e-406e-8904-8c5a3f5a8e19'
    ]

    // Find all
    const events = await prisma.politicalEvent.findMany({
        where: { id: { in: mobileIds } }
    })

    if (events.length > 1) {
        // Pick primary: The one with "Police Clash" or most comprehensive title?
        // Let's pick 'caaa173e-c0ac-4a74-9d45-2578e7b9d79b' (Dhaka road clash) as primary
        // Or 'aff14387...' (Mobile phone business program foiled)
        // Let's use the one with the latest update or generally best metadata.
        const primary = events.find(e => e.id === 'aff14387-9787-4ed1-9663-0625f950a1bf') || events[0]
        const duplicates = events.filter(e => e.id !== primary.id)

        console.log(`   Merging ${duplicates.length} into Primary: ${primary.title}`)

        // Update Primary Stats (Max)
        const maxKilled = Math.max(...events.map(e => e.killed || 0))
        const maxInjured = Math.max(...events.map(e => e.injured || 0))

        await prisma.politicalEvent.update({
            where: { id: primary.id },
            data: {
                killed: maxKilled,
                injured: maxInjured,
                additionalSources: JSON.stringify({
                    mergedFrom: duplicates.map(d => d.id),
                    duplicates: duplicates.map(d => ({ title: d.title }))
                })
            }
        })

        // Delete Duplicates
        await prisma.politicalEvent.deleteMany({
            where: { id: { in: duplicates.map(d => d.id) } }
        })
        console.log(`   ✅ Merged ${duplicates.length} mobile clash events`)
    } else {
        console.log('   ⚠️ Fewer than 2 mobile events found to merge.')
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
