
import { PrismaClient } from '@prisma/client'
import { geocodeLocation } from '../lib/geocoding'

const prisma = new PrismaClient()

async function main() {
    console.log("🚀 Starting Coordinate Fix Process...")

    const events = await prisma.politicalEvent.findMany()
    console.log(`📊 Found ${events.length} events to check.`)

    let updatedCount = 0
    let skippedCount = 0
    let failedCount = 0

    for (const event of events) {
        // Priority: Use existing 'district' field if present, else 'locationText'
        const locationQuery = event.district || event.locationText || ''

        if (!locationQuery) {
            console.log(`   ⏭️ ID: ${event.id} - No location info available using 'Dhaka' default? No, skipping.`)
            skippedCount++
            continue
        }

        const result = geocodeLocation(locationQuery)

        if (result) {
            // Check if update is needed (distance > 0.001 or district name mismatch)
            const latDiff = Math.abs((event.latitude || 0) - result.lat)
            const lngDiff = Math.abs((event.longitude || 0) - result.lng)
            const districtMismatch = event.district !== result.district

            // If coordinates are significantly different OR district name is not canonical
            if (latDiff > 0.0001 || lngDiff > 0.0001 || districtMismatch) {

                if (event.district === 'Dhaka' && result.district !== 'Dhaka') {
                    console.log(`   🔴 FIXING MISMATCH: ${event.title.substring(0, 30)}...`)
                    console.log(`      Current: ${event.district} [${event.latitude}, ${event.longitude}]`)
                    console.log(`      New:     ${result.district} [${result.lat}, ${result.lng}]`)
                } else if (districtMismatch) {
                    console.log(`   ✨ Standardizing District: ${event.district} -> ${result.district}`)
                }

                await prisma.politicalEvent.update({
                    where: { id: event.id },
                    data: {
                        latitude: result.lat,
                        longitude: result.lng,
                        district: result.district // Enforce canonical Bangla name
                    }
                })
                updatedCount++
            } else {
                skippedCount++
            }
        } else {
            console.log(`   ⚠️ Could not geocode: "${locationQuery}" (Event ID: ${event.id})`)
            failedCount++
        }
    }

    console.log("\n✅ Coordinate Fix Completed")
    console.log(`   - Updated: ${updatedCount}`)
    console.log(`   - Skipped: ${skippedCount} (Already correct)`)
    console.log(`   - Failed:  ${failedCount} (No match found)`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
