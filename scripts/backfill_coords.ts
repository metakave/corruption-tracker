
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simplified mapping: English Name -> { lat, lng }
// Source: lib/geocoding.ts
const districtCoords: Record<string, { lat: number; lng: number }> = {
    // Dhaka Division
    'Dhaka': { lat: 23.8103, lng: 90.4125 },
    'Gazipur': { lat: 23.9999, lng: 90.4203 },
    'Narayanganj': { lat: 23.6238, lng: 90.5000 },
    'Manikganj': { lat: 23.8617, lng: 90.0003 },
    'Munshiganj': { lat: 23.5422, lng: 90.5305 },
    'Tangail': { lat: 24.2513, lng: 89.9167 },
    'Kishoreganj': { lat: 24.4260, lng: 90.7763 },
    'Madaripur': { lat: 23.1641, lng: 90.1897 },
    'Shariatpur': { lat: 23.2423, lng: 90.4348 },
    'Faridpur': { lat: 23.6070, lng: 89.8429 },
    'Gopalganj': { lat: 23.0050, lng: 89.8266 },
    'Rajbari': { lat: 23.7574, lng: 89.6444 },
    'Narsingdi': { lat: 23.9322, lng: 90.7151 },

    // Chittagong Division
    'Chittagong': { lat: 22.3569, lng: 91.7832 },
    'Cox\'s Bazar': { lat: 21.4272, lng: 92.0058 },
    'Rangamati': { lat: 22.7324, lng: 92.2985 },
    'Bandarban': { lat: 22.1953, lng: 92.2183 },
    'Khagrachhari': { lat: 23.1193, lng: 91.9484 },
    'Feni': { lat: 23.0159, lng: 91.3976 },
    'Lakshmipur': { lat: 22.9447, lng: 90.8312 },
    'Comilla': { lat: 23.4607, lng: 91.1809 },
    'Noakhali': { lat: 22.8696, lng: 91.0995 },
    'Brahmanbaria': { lat: 23.9571, lng: 91.1115 },
    'Chandpur': { lat: 23.2332, lng: 90.6712 },

    // Rajshahi
    'Rajshahi': { lat: 24.3745, lng: 88.6042 },
    'Natore': { lat: 24.4206, lng: 89.0000 },
    'Naogaon': { lat: 24.8133, lng: 88.9283 },
    'Chapainawabganj': { lat: 24.5965, lng: 88.2775 },
    'Bogra': { lat: 24.8465, lng: 89.3770 },
    'Pabna': { lat: 24.0064, lng: 89.2372 },
    'Sirajganj': { lat: 24.4533, lng: 89.7006 },
    'Joypurhat': { lat: 25.0968, lng: 89.0227 },

    // Khulna
    'Khulna': { lat: 22.8456, lng: 89.5403 },
    'Bagerhat': { lat: 22.6602, lng: 89.7895 },
    'Jessore': { lat: 23.1634, lng: 89.2182 },
    'Jhenaidah': { lat: 23.5450, lng: 89.5100 },
    'Satkhira': { lat: 22.7185, lng: 89.0705 },
    'Narail': { lat: 23.1725, lng: 89.5125 },
    'Kushtia': { lat: 23.9012, lng: 89.1205 },
    'Chuadanga': { lat: 23.6401, lng: 88.8410 },
    'Magura': { lat: 23.4855, lng: 89.4198 },
    'Meherpur': { lat: 23.7979, lng: 88.6314 },

    // Barishal
    'Barishal': { lat: 22.7010, lng: 90.3535 },
    'Jhalokati': { lat: 22.6406, lng: 90.1871 },
    'Patuakhali': { lat: 22.3596, lng: 90.3298 },
    'Pirojpur': { lat: 22.5841, lng: 89.9720 },
    'Bhola': { lat: 22.6859, lng: 90.6482 },
    'Barguna': { lat: 22.1552, lng: 90.1121 },

    // Sylhet
    'Sylhet': { lat: 24.8949, lng: 91.8687 },
    'Moulvibazar': { lat: 24.4829, lng: 91.7774 },
    'Habiganj': { lat: 24.3745, lng: 91.4155 },
    'Sunamganj': { lat: 25.0657, lng: 91.3950 },

    // Rangpur
    'Rangpur': { lat: 25.7439, lng: 89.2752 },
    'Dinajpur': { lat: 25.6217, lng: 88.6354 },
    'Gaibandha': { lat: 25.3284, lng: 89.5430 },
    'Thakurgaon': { lat: 26.0336, lng: 88.4616 },
    'Panchagarh': { lat: 26.3411, lng: 88.5541 },
    'Kurigram': { lat: 25.8072, lng: 89.6297 },
    'Lalmonirhat': { lat: 25.9957, lng: 89.2846 },
    'Nilphamari': { lat: 25.9316, lng: 88.8562 },

    // Mymensingh
    'Mymensingh': { lat: 24.7471, lng: 90.4203 },
    'Jamalpur': { lat: 24.9375, lng: 89.9375 },
    'Sherpur': { lat: 25.0204, lng: 90.0152 },
    'Netrokona': { lat: 24.8804, lng: 90.7275 },
};

async function main() {
    console.log("Starting Geocoding Backfill...");

    // Find all events with missing Lat/Long but with District
    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { latitude: null },
                { longitude: null }
            ],
            // AND: { district: { not: null } } // optional
        }
    });

    console.log(`Found ${events.length} events missing coordinates.`);

    let fixed = 0;

    for (const event of events) {
        if (!event.district) continue;

        // Try exact match
        let coords = districtCoords[event.district];

        // Try variations (e.g. 'Cumilla' vs 'Comilla')
        if (!coords) {
            const key = Object.keys(districtCoords).find(k => k.toLowerCase() === event.district!.toLowerCase());
            if (key) coords = districtCoords[key];
        }

        // Try mapped lookups (common variations)
        if (!coords) {
            if (event.district === 'Bogra') coords = districtCoords['Bogura'];
            if (event.district === 'Jessore') coords = districtCoords['Jashore'];
            if (event.district === 'Barisal') coords = districtCoords['Barishal'];
            if (event.district === 'Comilla') coords = districtCoords['Cumilla'];
            if (event.district === 'Coxs Bazar') coords = districtCoords['Cox\'s Bazar'];
        }

        if (coords) {
            console.log(`Updating: ${event.district} -> ${coords.lat}, ${coords.lng}`);
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    latitude: coords.lat,
                    longitude: coords.lng
                }
            });
            fixed++;
        } else {
            console.log(`Skipping (Unknown District): ${event.district}`);
        }
    }

    console.log(`Done! Fixed ${fixed} events.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
