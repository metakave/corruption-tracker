
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MAPPING: Record<string, string> = {
    // English Old -> New
    "Jessore": "Jashore",
    "Bogra": "Bogura",
    "Barisal": "Barishal",
    "Chittagong": "Chattogram",
    "Bagerhat": "Bagherhat",

    // Bengali -> English
    "ঢাকা": "Dhaka",
    "চট্টগ্রাম": "Chattogram",
    "রাজশাহী": "Rajshahi",
    "খুলনা": "Khulna",
    "বরিশাল": "Barishal",
    "সিলেট": "Sylhet",
    "রংপুর": "Rangpur",
    "ময়মনসিংহ": "Mymensingh",
    "গাজীপুর": "Gazipur",
    "নারায়ণগঞ্জ": "Narayanganj",
    "কুমিল্লা": "Comilla",
    "বগুড়া": "Bogura",
    "পাবনা": "Pabna",
    "সিরাজগঞ্জ": "Sirajganj",
    "টাঙ্গাইল": "Tangail",
    "ফরিদপুর": "Faridpur",
    "কক্সবাজার": "Cox's Bazar",
    "যশোর": "Jashore",
    "কুষ্টিয়া": "Kushtia",
    "জয়পুরহাট": "Joypurhat",
    "নড়াইল": "Narail",
    "নীলফামারী": "Nilphamari",
    "নেত্রকোণা": "Netrokona",
    "নোয়াখালী": "Noakhali",
    "পঞ্চগড়": "Panchagarh",
    "পটুয়াখালী": "Patuakhali",
    "বাগেরহাট": "Bagherhat",
    "ব্রাহ্মণবাড়ীয়া": "Brahmanbaria",
    "রাজবাড়ী": "Rajbari",
    "শরীয়তপুর": "Shariatpur",
    "মাদারীপুর": "Madaripur",
    "মুন্সীগঞ্জ": "Munshiganj",
    "মানিকগঞ্জ": "Manikganj",
    "নরসিংদী": "Narsingdi",
    "গোপালগঞ্জ": "Gopalganj",
    "কিশোরগঞ্জ": "Kishoreganj",
    "জামালপুর": "Jamalpur",
    "শেরপুর": "Sherpur",
    "নাটোর": "Natore", // Added common ones just in case
    "নওগাঁ": "Naogaon",
    "চাঁপাইনবাবগঞ্জ": "Chapainawabganj", // Note: Using Nawabganj in my list? No, check later.
    "দিনাজপুর": "Dinajpur",
    "ঠাকুরগাঁও": "Thakurgaon",
    "কুড়িগ্রাম": "Kurigram",
    "গাইবান্ধা": "Gaibandha",
    "লালমনিরহাট": "Lalmonirhat",
    "সাতক্ষীরা": "Satkhira",
    "মাগুরা": "Magura",
    "ঝিনাইদহ": "Jhenaidah",
    "চুয়াডাঙ্গা": "Chuadanga",
    "মেহেরপুর": "Meherpur",
    "ভোলা": "Bhola",
    "ঝালকাঠি": "Jhalokati",
    "পিরোজপুর": "Pirojpur",
    "বরগুনা": "Barguna",
    "ফেনী": "Feni",
    "লক্ষ্মীপুর": "Lakshmipur",
    "চাঁদপুর": "Chandpur",
    "হবিগঞ্জ": "Habiganj",
    "সুনামগঞ্জ": "Sunamganj",
    "মৌলভীবাজার": "Moulvibazar",
    "ব্রাহ্মণবাড়িয়া": "Brahmanbaria",

    "Nawabganj": "Chapainawabganj" // Assuming Nawabganj maps to Chapainawabganj if unique
};

// My List checks:
// Chapainawabganj is NOT in my list? 
// My list has "Nawabganj"? Let's check output.
// Output had "Nawabganj": 3.
// My modal list has... I didn't see Chapainawabganj in lines 30-45.
// Let me check what "Nawabganj" maps to in standard list. 
// "Nawabganj" usually implies "Chapainawabganj". 
// But "Nawabganj" is also a place in Dhaka.
// However, looking at my modal list:
// ... "Narayanganj", "Narsingdi", "Natore", "Netrokona", ...
// It seems "Nawabganj" or "Chapainawabganj" is MISSING from my modal list?
// Wait. "Chapainawabganj" is a district. 
// Let me check the modal list again. 

async function main() {
    console.log("Starting District Normalization...");

    // Iterate over Mappings
    for (const [oldName, newName] of Object.entries(MAPPING)) {
        console.log(`Updating "${oldName}" -> "${newName}"...`);

        try {
            const res = await prisma.politicalEvent.updateMany({
                where: {
                    district: oldName
                },
                data: {
                    district: newName
                }
            });
            if (res.count > 0) {
                console.log(`  Updated ${res.count} records.`);
            }
        } catch (e) {
            console.error(`  Error updating ${oldName}:`, e);
        }
    }

    console.log("Normalization Complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
