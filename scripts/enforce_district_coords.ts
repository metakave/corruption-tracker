import { PrismaClient } from '@prisma/client'
import { bangladeshDistricts } from '../lib/geocoding'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function enforceDistrictCoordinates() {
    console.log('🔧 Enforcing strict district-level coordinates...\n')

    const allEvents = await prisma.politicalEvent.findMany()
    console.log(`📊 Checking ${allEvents.length} events\n`)

    let fixedCount = 0

    for (const event of allEvents) {
        if (!event.district) {
            console.log(`⚠️  Event has no district: ${event.title.substring(0, 50)}...`)
            continue
        }

        // Get correct district coordinates
        const districtData = bangladeshDistricts[event.district]

        if (!districtData) {
            console.log(`❌ Unknown district "${event.district}": ${event.title.substring(0, 50)}...`)
            continue
        }

        // Check if coordinates match district center
        const latMatch = Math.abs(event.latitude - districtData.lat) < 0.0001
        const lngMatch = Math.abs(event.longitude - districtData.lng) < 0.0001

        if (!latMatch || !lngMatch) {
            console.log(`🔄 Fixing coordinates for: ${event.title.substring(0, 50)}...`)
            console.log(`   District: ${event.district}`)
            console.log(`   Current: ${event.latitude}, ${event.longitude}`)
            console.log(`   Correct: ${districtData.lat}, ${districtData.lng}`)

            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    latitude: districtData.lat,
                    longitude: districtData.lng
                }
            })

            fixedCount++
            console.log(`   ✅ Fixed!\n`)
        }
    }

    console.log(`\n🏁 Enforcement Complete!`)
    console.log(`   Total Events: ${allEvents.length}`)
    console.log(`   Fixed: ${fixedCount}`)
    console.log(`   Correct: ${allEvents.length - fixedCount}`)
}

enforceDistrictCoordinates()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
