
import { geocodeLocation, bangladeshDistricts } from '../lib/geocoding'

const testCases = [
    "Kurigram",
    "Kurigram Sadar",
    "কুড়িগ্রাম",
    "কুড়িগ্রাম", // Variant 2
    "Dhaka",
    "Savar",
    "Feni",
    "Cox's Bazar",
    "Coxs Bazar",
    "RandomPlace"
]

console.log("Testing Geocoding Logic...")

testCases.forEach(loc => {
    const result = geocodeLocation(loc)
    console.log(`Input: "${loc}" => Found: ${result ? result.district : 'NULL'} [${result?.lat}, ${result?.lng}]`)
})

// Check specific coordinates for Kurigram in the map
console.log("\nDirect Lookup 'কুড়িগ্রাম':", bangladeshDistricts['কুড়িগ্রাম'])
console.log("Direct Lookup 'কুড়িগ্রাম' (Variant):", bangladeshDistricts['কুড়িগ্রাম'])
