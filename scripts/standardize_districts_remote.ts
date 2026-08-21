
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map from Bangla to English based on lib/constants.ts
const DISTRICTS_BN_MAP: Record<string, string> = {
    "বাগেরহাট": "Bagerhat",
    "বান্দরবান": "Bandarban",
    "বরগুনা": "Barguna",
    "বরিশাল": "Barishal",
    "ভোলা": "Bhola",
    "বগুড়া": "Bogura",
    "ব্রাহ্মণবাড়িয়া": "Brahmanbaria",
    "চাঁদপুর": "Chandpur",
    "চাঁপাইনবাবগঞ্জ": "Chapai Nawabganj",
    "চট্টগ্রাম": "Chattogram", // Or Chittagong? Using Chattogram as per map
    "চুয়াডাঙ্গা": "Chuadanga",
    "কুমিল্লা": "Cumilla",
    "কক্সবাজার": "Cox's Bazar",
    "ঢাকা": "Dhaka",
    "দিনাজপুর": "Dinajpur",
    "ফরিদপুর": "Faridpur",
    "ফেনী": "Feni",
    "গাইবান্ধা": "Gaibandha",
    "গাজীপুর": "Gazipur",
    "গোপালগঞ্জ": "Gopalganj",
    "হবিগঞ্জ": "Habiganj",
    "জামালপুর": "Jamalpur",
    "যশোর": "Jashore",
    "ঝালকাঠি": "Jhalokati",
    "ঝিনাইদহ": "Jhenaidah",
    "জয়পুরহাট": "Joypurhat",
    "খাগড়াছড়ি": "Khagrachhari",
    "খুলনা": "Khulna",
    "কিশোরগঞ্জ": "Kishoreganj",
    "কুড়িগ্রাম": "Kurigram",
    "কুষ্টিয়া": "Kushtia",
    "লক্ষ্মীপুর": "Lakshmipur",
    "লালমনিরহাট": "Lalmonirhat",
    "মাদারীপুর": "Madaripur",
    "মাগুরা": "Magura",
    "মানিকগঞ্জ": "Manikganj",
    "মেহেরপুর": "Meherpur",
    "মৌলভীবাজার": "Moulvibazar",
    "মুন্সীগঞ্জ": "Munshiganj",
    "ময়মনসিংহ": "Mymensingh",
    "নওগাঁ": "Naogaon",
    "নড়াইল": "Narail",
    "নারায়ণগঞ্জ": "Narayanganj",
    "নারায়ণগঞ্জ": "Narayanganj", // Variation with 'n'
    "নারায়নগঞ্জ": "Narayanganj", // Variation with 'y' and 'n'
    "নরসিংদী": "Narsingdi",
    "নাটোর": "Natore",
    "নেত্রকোনা": "Netrokona",
    "নীলফামারী": "Nilphamari",
    "নোয়াখালী": "Noakhali",
    "পাবনা": "Pabna",
    "পঞ্চগড়": "Panchagarh",
    "পটুয়াখালী": "Patuakhali",
    "পিরোজপুর": "Pirojpur",
    "রাজবাড়ী": "Rajbari",
    "রাজশাহী": "Rajshahi",
    "রাঙ্গামাটি": "Rangamati",
    "রংপুর": "Rangpur",
    "সাতক্ষীরা": "Satkhira",
    "শরীয়তপুর": "Shariatpur",
    "শেরপুর": "Sherpur",
    "সিরাজগঞ্জ": "Sirajganj",
    "সুনামগঞ্জ": "Sunamganj",
    "সিলেট": "Sylhet",
    "টাঙ্গাইল": "Tangail",
    "ঠাকুরগাঁও": "Thakurgaon",
    "Thakurgaon": "Thakurgaon",

    // Fixes based on DB analysis
    "Bogra": "Bogura",
    "Comilla": "Cumilla",
    "Nawabganj": "Chapai Nawabganj",
    "Not Specified": "Unknown",

    // Remaining Bangla found in logs
    "নোয়াখালী": "Noakhali",
    "পঞ্চগড়": "Panchagarh",
    "পটুয়াখালী": "Patuakhali",
    "ব্রাহ্মণবাড়ীয়া": "Brahmanbaria",
    "রাজবাড়ী": "Rajbari",
    "শরীয়তপুর": "Shariatpur",

    // Some common variations or typos found in logs
    "Chittagong": "Chattogram",
    "Barisal": "Barishal",
    "Jessore": "Jashore",
    "Jhalokathi": "Jhalokati",
};

async function main() {
    console.log("Standardizing district names for ALL events...");

    const events = await prisma.politicalEvent.findMany({
        where: {
            // Optimization: Only select events where district != null
            district: {
                not: null
            }
        },
        select: {
            id: true,
            district: true
        }
    });

    console.log(`Checking ${events.length} events...`);
    let updateCount = 0;

    for (const event of events) {
        if (!event.district) continue;

        let fixedDistrict = event.district.trim();
        let needsUpdate = false;

        // Check if it's in our mapping (Bangla -> English)
        if (DISTRICTS_BN_MAP[fixedDistrict]) {
            fixedDistrict = DISTRICTS_BN_MAP[fixedDistrict];
            needsUpdate = true;
        }

        // Also handle cases like "Unknown" or mixed case if needed, but primarily Bangla to English 

        if (needsUpdate) {
            console.log(`Updating ${event.id}: ${event.district} -> ${fixedDistrict}`);
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: { district: fixedDistrict }
            });
            updateCount++;
        }
    }

    console.log(`Standardization complete. Updated ${updateCount} events.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
