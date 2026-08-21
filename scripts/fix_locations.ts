
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Bengali to English District Mapping
const districtMap: Record<string, string> = {
    // Dhaka Division
    'ঢাকা': 'Dhaka', 'ফরিদপুর': 'Faridpur', 'গাজীপুর': 'Gazipur', 'গোপালগঞ্জ': 'Gopalganj', 'কিশোরগঞ্জ': 'Kishoreganj',
    'মাদারীপুর': 'Madaripur', 'মানিকগঞ্জ': 'Manikganj', 'মুন্সিগঞ্জ': 'Munshiganj', 'নারায়ণগঞ্জ': 'Narayanganj',
    'নরসিংদী': 'Narsingdi', 'রাজবাড়ী': 'Rajbari', 'শরীয়তপুর': 'Shariatpur', 'টাঙ্গাইল': 'Tangail',

    // Chattogram Division
    'বান্দরবান': 'Bandarban', 'ব্রাহ্মণবাড়িয়া': 'Brahmanbaria', 'চাঁদপুর': 'Chandpur', 'চট্টগ্রাম': 'Chittagong',
    'কুমিল্লা': 'Comilla', 'কক্সবাজার': 'Cox\'s Bazar', 'ফেনী': 'Feni', 'খাগড়াছড়ি': 'Khagrachhari',
    'লক্ষ্মীপুর': 'Lakshmipur', 'নোয়াখালী': 'Noakhali', 'রাঙামাটি': 'Rangamati',

    // Rajshahi Division
    'বগুড়া': 'Bogra', 'জয়পুরহাট': 'Joypurhat', 'নওগাঁ': 'Naogaon', 'নাটোর': 'Natore',
    'নবাবগঞ্জ': 'Nawabganj', 'পাবনা': 'Pabna', 'রাজশাহী': 'Rajshahi', 'সিরাজগঞ্জ': 'Sirajganj',

    // Khulna Division
    'বাগেরহাট': 'Bagerhat', 'চুয়াডাঙ্গা': 'Chuadanga', 'যশোর': 'Jessore', 'ঝিনাইদহ': 'Jhenaidah',
    'খুলনা': 'Khulna', 'কুষ্টিয়া': 'Kushtia', 'মাগুরা': 'Magura', 'মেহেরপুর': 'Meherpur',
    'নড়াইল': 'Narail', 'সাতক্ষীরা': 'Satkhira',

    // Barishal Division
    'বরগুনা': 'Barguna', 'বরিশাল': 'Barishal', 'ভোলা': 'Bhola', 'ঝালকাঠি': 'Jhalokati',
    'পটুয়াখালী': 'Patuakhali', 'পিরোজপুর': 'Pirojpur',

    // Sylhet Division
    'হবিগঞ্জ': 'Habiganj', 'মৌলভীবাজার': 'Moulvibazar', 'সুনামগঞ্জ': 'Sunamganj', 'সিলেট': 'Sylhet',

    // Rangpur Division
    'দিনাজপুর': 'Dinajpur', 'গাইবান্ধা': 'Gaibandha', 'কুড়িগ্রাম': 'Kurigram', 'লালমনিরহাট': 'Lalmonirhat',
    'নীলফামারী': 'Nilphamari', 'পঞ্চগড়': 'Panchagarh', 'রংপুর': 'Rangpur', 'ঠাকুরগাঁও': 'Thakurgaon',

    // Mymensingh Division
    'জামালপুর': 'Jamalpur', 'ময়মনসিংহ': 'Mymensingh', 'নেত্রকোণা': 'Netrokona', 'শেরপুর': 'Sherpur'
};

async function main() {
    console.log("🚀 Starting Location Fix...");

    const events = await prisma.politicalEvent.findMany();
    let fixedCount = 0;

    for (const event of events) {
        let text = (event.title || '') + ' ' + (event.summary || '');

        // Check for District in Text
        let foundDistrict: string | null = null;

        for (const [bnName, enName] of Object.entries(districtMap)) {
            // Check for variations like "Faridpur-e", "Faridpur-er" -> ফরিদপুরে, ফরিদপুরের, ফরিদপুর
            if (text.includes(bnName)) {
                foundDistrict = enName;
                break; // Prioritize first match? Or strict based on title?
            }
        }

        // Special handling for "Faridpur" mentioned by user
        if (event.title?.includes('ফরিদপুরে')) foundDistrict = 'Faridpur';

        if (foundDistrict && foundDistrict !== event.district) {
            console.log(`🔧 Fixing ID: ${event.id}`);
            console.log(`   Title: ${event.title}`);
            console.log(`   Old District: ${event.district} -> New District: ${foundDistrict}`);

            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: { district: foundDistrict }
            });
            fixedCount++;
        }
    }

    console.log(`\n✅ Location Fix Complete. Fixed ${fixedCount} events.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
