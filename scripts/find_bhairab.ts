import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function findBhairabEvent() {
    console.log('🔍 Finding Bhairab event incorrectly marked as Nilphamari...\n')

    // Find all Nilphamari events
    const nilphamariEvents = await prisma.politicalEvent.findMany({
        where: { district: 'নীলফামারী' }
    })

    console.log(`Found ${nilphamariEvents.length} events in Nilphamari:\n`)

    for (const event of nilphamariEvents) {
        const hasBhairab = event.title.includes('ভৈরব') ||
            event.locationText?.includes('ভৈরব') ||
            event.summary?.includes('ভৈরব') ||
            event.title.includes('কিশোরগঞ্জ') ||
            event.locationText?.includes('কিশোরগঞ্জ')

        if (hasBhairab) {
            console.log(`⚠️  FOUND MISPLACED EVENT:`)
            console.log(`   ID: ${event.id}`)
            console.log(`   Title: ${event.title}`)
            console.log(`   Location Text: ${event.locationText}`)
            console.log(`   District: ${event.district} (WRONG!)`)
            console.log(`   Coordinates: ${event.latitude}, ${event.longitude}`)
            console.log(`   Should be: কিশোরগঞ্জ\n`)

            // Fix it
            console.log(`   🔧 Fixing to Kishoreganj...`)
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    district: 'কিশোরগঞ্জ',
                    latitude: 24.444,  // Kishoreganj district center
                    longitude: 90.7769
                }
            })
            console.log(`   ✅ Fixed!\n`)
        } else {
            console.log(`✓ ${event.title.substring(0, 60)}...`)
        }
    }

    // Also check for events with very specific coordinates (not district centers)
    console.log(`\n\n🔍 Checking for events with specific location coordinates...\n`)

    const allEvents = await prisma.politicalEvent.findMany()

    for (const event of allEvents) {
        // District centers typically have round numbers or known values
        // Specific locations have more decimal precision
        const lat = event.latitude
        const lng = event.longitude

        // Check if coordinates have more than 2 decimal places (likely specific location)
        const latPrecision = (lat.toString().split('.')[1] || '').length
        const lngPrecision = (lng.toString().split('.')[1] || '').length

        if (latPrecision > 3 || lngPrecision > 3) {
            console.log(`📍 Specific location coords:`)
            console.log(`   ${event.district}: ${event.title.substring(0, 50)}...`)
            console.log(`   Coords: ${lat}, ${lng} (precision: ${latPrecision}, ${lngPrecision})`)
        }
    }
}

findBhairabEvent()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
