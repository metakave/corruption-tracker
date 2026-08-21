import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function fixMerges() {
    console.log('🔧 Fixing incorrectly merged events...\n')

    // 1. Find the merged Jan 4 protest event (should have BTRC attack as additional source)
    const jan4Events = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: new Date('2026-01-04T00:00:00Z'),
                lte: new Date('2026-01-04T23:59:59Z')
            },
            district: 'ঢাকা',
            title: {
                contains: 'মুঠোফোন'
            }
        }
    })

    console.log(`Found ${jan4Events.length} Jan 4 mobile phone events`)

    for (const event of jan4Events) {
        console.log(`\n📋 Checking event: ${event.title.substring(0, 60)}...`)

        if (!event.additionalSources) continue

        const additionalSources = JSON.parse(event.additionalSources)
        console.log(`   Additional sources: ${additionalSources.length}`)

        // Find the BTRC attack source (Jan 1 incident)
        const btrcSource = additionalSources.find((s: any) =>
            s.title?.includes('বিটিআরসি') || s.title?.includes('আগারগাঁও')
        )

        if (btrcSource) {
            console.log(`\n   ⚠️  Found incorrectly merged BTRC attack: ${btrcSource.title?.substring(0, 50)}...`)
            console.log(`   🔄 Unmerging by creating separate event...`)

            // Create new event for the BTRC attack (Jan 1)
            await prisma.politicalEvent.create({
                data: {
                    title: btrcSource.title || 'বিটিআরসি ভবনে মোবাইল ফোন ব্যবসায়ীদের হামলা ও ভাঙচুর',
                    url: btrcSource.url,
                    source: btrcSource.source || 'Jugantor',
                    publishedAt: new Date('2026-01-01T12:00:00Z'),
                    dateOfIncident: new Date('2026-01-01T12:00:00Z'),
                    locationText: 'আগারগাঁও, ঢাকা',
                    district: 'ঢাকা',
                    latitude: 23.7756,
                    longitude: 90.3780,
                    politicalParties: '["Mobile Phone Businessmen"]',
                    injured: 0,
                    killed: 0,
                    summary: 'মোবাইল ফোন ব্যবসায়ীরা বিটিআরসি ভবনে হামলা ও ভাঙচুর করেছে।',
                    severityScore: 4,
                    confidence: 0.80,
                    tags: '["Vandalism","Attack on Government Property"]',
                    images: '[]',
                    rawText: '',
                    isBangladesh: true,
                    isPoliticalViolence: true
                }
            })

            // Remove BTRC source from Jan 4 event
            const updatedSources = additionalSources.filter((s: any) => s.url !== btrcSource.url)
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: { additionalSources: JSON.stringify(updatedSources) }
            })

            console.log(`   ✅ Unmerged successfully!`)
            console.log(`      - Created Jan 1 BTRC attack as separate event`)
            console.log(`      - Removed from Jan 4 protest sources`)
        }
    }

    // 2. Now merge the two Jan 4 protest duplicates (Dhaka vs Unknown)
    console.log(`\n\n🔍 Looking for Jan 4 protest duplicates...`)

    const allJan4 = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: new Date('2026-01-04T00:00:00Z'),
                lte: new Date('2026-01-04T23:59:59Z')
            },
            title: {
                contains: 'মুঠোফোন'
            }
        }
    })

    console.log(`Found ${allJan4.length} Jan 4 mobile phone events`)

    if (allJan4.length >= 2) {
        // Keep the one with district, merge the Unknown one
        const withDistrict = allJan4.find(e => e.district === 'ঢাকা')
        const withoutDistrict = allJan4.find(e => !e.district || e.district === 'Unknown')

        if (withDistrict && withoutDistrict) {
            console.log(`\n  🔄 Merging duplicate Jan 4 protests:`)
            console.log(`     KEEP: ${withDistrict.title.substring(0, 50)}... (District: ${withDistrict.district})`)
            console.log(`     DELETE: ${withoutDistrict.title.substring(0, 50)}... (District: ${withoutDistrict.district})`)

            // Add as additional source if URL different
            if (withDistrict.url !== withoutDistrict.url) {
                const currentSources = withDistrict.additionalSources ?
                    JSON.parse(withDistrict.additionalSources) : []

                currentSources.push({
                    url: withoutDistrict.url,
                    source: withoutDistrict.source,
                    title: withoutDistrict.title
                })

                await prisma.politicalEvent.update({
                    where: { id: withDistrict.id },
                    data: { additionalSources: JSON.stringify(currentSources) }
                })
            }

            // Delete duplicate
            await prisma.politicalEvent.delete({ where: { id: withoutDistrict.id } })
            console.log(`     ✅ Merged successfully!`)
        }
    }

    console.log(`\n\n🏁 Fix Complete!`)
    const finalCount = await prisma.politicalEvent.count()
    console.log(`   Final Event Count: ${finalCount}`)
}

fixMerges()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
