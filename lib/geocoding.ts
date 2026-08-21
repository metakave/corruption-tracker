// Bangladesh District Geocoding
// District name to coordinates mapping

export const bangladeshDistricts: { [key: string]: { lat: number; lng: number; division: string } } = {
    // Dhaka Division
    'ঢাকা': { lat: 23.8103, lng: 90.4125, division: 'ঢাকা' },
    'গাজীপুর': { lat: 23.9999, lng: 90.4203, division: 'ঢাকা' },
    'নারায়ণগঞ্জ': { lat: 23.6238, lng: 90.5000, division: 'ঢাকা' },
    'মানিকগঞ্জ': { lat: 23.8617, lng: 90.0003, division: 'ঢাকা' },
    'মুন্সীগঞ্জ': { lat: 23.5422, lng: 90.5305, division: 'ঢাকা' },
    'টাঙ্গাইল': { lat: 24.2513, lng: 89.9167, division: 'ঢাকা' },
    'কিশোরগঞ্জ': { lat: 24.4260, lng: 90.7763, division: 'ঢাকা' },
    'মাদারীপুর': { lat: 23.1641, lng: 90.1897, division: 'ঢাকা' },
    'শরীয়তপুর': { lat: 23.2423, lng: 90.4348, division: 'ঢাকা' },
    'ফরিদপুর': { lat: 23.6070, lng: 89.8429, division: 'ঢাকা' },
    'গোপালগঞ্জ': { lat: 23.0050, lng: 89.8266, division: 'ঢাকা' },
    'রাজবাড়ী': { lat: 23.7574, lng: 89.6444, division: 'ঢাকা' },
    'নরসিংদী': { lat: 23.9322, lng: 90.7151, division: 'ঢাকা' },

    // Chittagong Division
    'চট্টগ্রাম': { lat: 22.3569, lng: 91.7832, division: 'চট্টগ্রাম' },
    'কক্সবাজার': { lat: 21.4272, lng: 92.0058, division: 'চট্টগ্রাম' },
    'রাঙ্গামাটি': { lat: 22.7324, lng: 92.2985, division: 'চট্টগ্রাম' },
    'বান্দরবান': { lat: 22.1953, lng: 92.2183, division: 'চট্টগ্রাম' },
    'খাগড়াছড়ি': { lat: 23.1193, lng: 91.9484, division: 'চট্টগ্রাম' },
    'ফেনী': { lat: 23.0159, lng: 91.3976, division: 'চট্টগ্রাম' },
    'লক্ষ্মীপুর': { lat: 22.9447, lng: 90.8312, division: 'চট্টগ্রাম' },
    'কুমিল্লা': { lat: 23.4607, lng: 91.1809, division: 'চট্টগ্রাম' },
    'নোয়াখালী': { lat: 22.8696, lng: 91.0995, division: 'চট্টগ্রাম' },
    'ব্রাহ্মণবাড়ীয়া': { lat: 23.9571, lng: 91.1115, division: 'চট্টগ্রাম' },
    'চাঁদপুর': { lat: 23.2332, lng: 90.6712, division: 'চট্টগ্রাম' },

    // Rajshahi Division
    'রাজশাহী': { lat: 24.3745, lng: 88.6042, division: 'রাজশাহী' },
    'নাটোর': { lat: 24.4206, lng: 89.0000, division: 'রাজশাহী' },
    'নওগাঁ': { lat: 24.8133, lng: 88.9283, division: 'রাজশাহী' },
    'চাঁপাইনবাবগঞ্জ': { lat: 24.5965, lng: 88.2775, division: 'রাজশাহী' },
    'বগুড়া': { lat: 24.8465, lng: 89.3770, division: 'রাজশাহী' },
    'পাবনা': { lat: 24.0064, lng: 89.2372, division: 'রাজশাহী' },
    'সিরাজগঞ্জ': { lat: 24.4533, lng: 89.7006, division: 'রাজশাহী' },
    'জয়পুরহাট': { lat: 25.0968, lng: 89.0227, division: 'রাজশাহী' },

    // Khulna Division
    'খুলনা': { lat: 22.8456, lng: 89.5403, division: 'খুলনা' },
    'বাগেরহাট': { lat: 22.6602, lng: 89.7895, division: 'খুলনা' },
    'যশোর': { lat: 23.1634, lng: 89.2182, division: 'খুলনা' },
    'ঝিনাইদহ': { lat: 23.5450, lng: 89.5100, division: 'খুলনা' },
    'সাতক্ষীরা': { lat: 22.7185, lng: 89.0705, division: 'খুলনা' },
    'নড়াইল': { lat: 23.1725, lng: 89.5125, division: 'খুলনা' },
    'কুষ্টিয়া': { lat: 23.9012, lng: 89.1205, division: 'খুলনা' },
    'চুয়াডাঙ্গা': { lat: 23.6401, lng: 88.8410, division: 'খুলনা' },
    'মাগুরা': { lat: 23.4855, lng: 89.4198, division: 'খুলনা' },
    'মেহেরপুর': { lat: 23.7979, lng: 88.6314, division: 'খুলনা' },

    // Barisal Division
    'বরিশাল': { lat: 22.7010, lng: 90.3535, division: 'বরিশাল' },
    'ঝালকাঠি': { lat: 22.6406, lng: 90.1871, division: 'বরিশাল' },
    'পটুয়াখালী': { lat: 22.3596, lng: 90.3298, division: 'বরিশাল' },
    'পিরোজপুর': { lat: 22.5841, lng: 89.9720, division: 'বরিশাল' },
    'ভোলা': { lat: 22.6859, lng: 90.6482, division: 'বরিশাল' },
    'বরগুনা': { lat: 22.1552, lng: 90.1121, division: 'বরিশাল' },

    // Sylhet Division
    'সিলেট': { lat: 24.8949, lng: 91.8687, division: 'সিলেট' },
    'মৌলভীবাজার': { lat: 24.4829, lng: 91.7774, division: 'সিলেট' },
    'হবিগঞ্জ': { lat: 24.3745, lng: 91.4155, division: 'সিলেট' },
    'সুনামগঞ্জ': { lat: 25.0657, lng: 91.3950, division: 'সিলেট' },

    // Rangpur Division
    'রংপুর': { lat: 25.7439, lng: 89.2752, division: 'রংপুর' },
    'দিনাজপুর': { lat: 25.6217, lng: 88.6354, division: 'রংপুর' },
    'গাইবান্ধা': { lat: 25.3284, lng: 89.5430, division: 'রংপুর' },
    'ঠাকুরগাঁও': { lat: 26.0336, lng: 88.4616, division: 'রংপুর' },
    'পঞ্চগড়': { lat: 26.3411, lng: 88.5541, division: 'রংপুর' },
    'কুড়িগ্রাম': { lat: 25.8072, lng: 89.6297, division: 'রংপুর' },
    'লালমনিরহাট': { lat: 25.9957, lng: 89.2846, division: 'রংপুর' },
    'নীলফামারী': { lat: 25.9316, lng: 88.8562, division: 'রংপুর' },

    // Mymensingh Division
    'ময়মনসিংহ': { lat: 24.7471, lng: 90.4203, division: 'ময়মনসিংহ' },
    'জামালপুর': { lat: 24.9375, lng: 89.9375, division: 'ময়মনসিংহ' },
    'শেরপুর': { lat: 25.0204, lng: 90.0152, division: 'ময়মনসিংহ' },
    'নেত্রকোণা': { lat: 24.8804, lng: 90.7275, division: 'ময়মনসিংহ' },
}

// User-provided Comprehensive Dataset
const DISTRICT_DATA = [
    {
        "division": "Chattogram",
        "districts": [
            {
                "name": "Chattogram",
                "bn_name": "চট্টগ্রাম",
                "variations": ["Chittagong", "Chitagong", "Chattagram", "Chattogram"],
                "bn_variations": ["চট্টগ্রাম", "চট্রগ্রাম", "চিটাগাং", "চিটাগং", "চট্রগাম", "চট্রাগ্রাম", "চট্টগ্রাম জেলা", "চট্টলা"],
                "upazilas": ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari", "Karnaphuli", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"]
            },
            {
                "name": "Cox's Bazar",
                "bn_name": "কক্সবাজার",
                "variations": ["Coxs Bazar", "Coxsbazar", "Cox'sBazar", "Cox Bazar"],
                "bn_variations": ["কক্সবাজার", "কক্স বাজার", "ককসবাজার", "ককস বাজার", "কোক্সবাজার", "কক্সবাজার জেলা", "কক্স বাজার জেলা", "কক্‌সবাজার"],
                "upazilas": ["Chakaria", "Cox's Bazar Sadar", "Kutubdia", "Maheshkhali", "Ramu", "Teknaf", "Ukhia", "Pekua", "Eidgaon"]
            },
            {
                "name": "Cumilla",
                "bn_name": "কুমিল্লা",
                "variations": ["Comilla", "Komilla", "Kumilla"],
                "bn_variations": ["কুমিল্লা", "কুমিলা", "কুমিল্হা", "কুমিল্লা জেলা", "কুমিল্ল", "কুমিল", "কুমিল্লা সদর"],
                "upazilas": ["Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Cumilla Adarsha Sadar", "Meghna", "Titas", "Monohargonj", "Cumilla Sadar Dakshin", "Lalmai"]
            },
            {
                "name": "Brahmanbaria",
                "bn_name": "ব্রাহ্মণবাড়িয়া",
                "variations": ["Bramonbaria", "Brahmanbaria", "B.Baria", "B Baria"],
                "bn_variations": ["ব্রাহ্মণবাড়িয়া", "ব্রাহ্মণবাড়ীয়া", "ব্রাক্ষণবাড়িয়া", "ব্রাম্মনবাড়িয়া", "ব্রামনবাড়িয়া", "বি বাড়িয়া", "বি.বাড়িয়া", "বিবাড়িয়া", "ব্রামনবাড়ীয়া"],
                "upazilas": ["Akhaura", "Bancharampur", "Brahmanbaria Sadar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail", "Ashuganj", "Bijoynagar"]
            },
            {
                "name": "Lakshmipur",
                "bn_name": "লক্ষ্মীপুর",
                "variations": ["Laxmipur", "Lakshmipur"],
                "bn_variations": ["লক্ষ্মীপুর", "লক্ষীপুর", "লক্মীপুর", "লক্ষিপুর", "লক্ষ্মী পুর", "লহ্মীপুর", "লক্ষী পুর", "লক্ষীপুর জেলা"],
                "upazilas": ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"]
            },
            {
                "name": "Noakhali",
                "bn_name": "নোয়াখালী",
                "variations": ["Noakhali", "Noakhaly"],
                "bn_variations": ["নোয়াখালী", "নোয়াখালী", "নোয়াখালি", "নোয়াখালি", "নোয়া খালী", "নোয়া খালি", "নোয়াখালী জেলা"],
                "upazilas": ["Begumganj", "Noakhali Sadar", "Chatkhil", "Companiganj", "Hatiya", "Senbagh", "Sonaimuri", "Subarnachar", "Kabirhat"]
            },
            {
                "name": "Feni",
                "bn_name": "ফেনী",
                "variations": ["Feni", "Feny"],
                "bn_variations": ["ফেনী", "ফেনি", "ফেনী জেলা", "ফেনী সদর", "ফ্যেনি", "ফেনি জেলা"],
                "upazilas": ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Parshuram", "Sonagazi", "Fulgazi"]
            },
            {
                "name": "Khagrachhari",
                "bn_name": "খাগড়াছড়ি",
                "variations": ["Khagrachari", "Khagrachhari"],
                "bn_variations": ["খাগড়াছড়ি", "খাগরাছড়ি", "খাগড়াছরি", "খাগরাছরি", "খাগড়াছড়ি", "খাগড়া ছড়ি", "খাগরা ছড়ি"],
                "upazilas": ["Dighinala", "Khagrachhari Sadar", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh", "Guimara"]
            },
            {
                "name": "Rangamati",
                "bn_name": "রাঙ্গামাটি",
                "variations": ["Rangamati", "Rangamatti"],
                "bn_variations": ["রাঙ্গামাটি", "রাঙামাটি", "রাঙ্গামাটী", "রাঙামাটী", "রাঙ্গা মাটি", "রাঙা মাটি", "রাঙ্গামাটি জেলা", "রাঙামাটি জেলা"],
                "upazilas": ["Bagaichhari", "Barkal", "Kawkhali", "Belaichhari", "Kaptai", "Juraichhari", "Langadu", "Naniyachar", "Rajasthali", "Rangamati Sadar"]
            },
            {
                "name": "Bandarban",
                "bn_name": "বান্দরবান",
                "variations": ["Bandarban", "Bandarbon"],
                "bn_variations": ["বান্দরবান", "বান্দরবন", "বান্দর বান", "বান্দর বন", "বান্দরবান জেলা", "বান্দরবন জেলা"],
                "upazilas": ["Ali Kadam", "Bandarban Sadar", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"]
            },
            {
                "name": "Chandpur",
                "bn_name": "চাঁদপুর",
                "variations": ["Chandpur"],
                "bn_variations": ["চাঁদপুর", "চাদপুর", "চাঁদ পুর", "চাদ পুর", "চাঁদপুর জেলা", "চাদপুর জেলা", "ইলিশের বাড়ি"],
                "upazilas": ["Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"]
            }
        ]
    },
    {
        "division": "Dhaka",
        "districts": [
            {
                "name": "Dhaka",
                "bn_name": "ঢাকা",
                "variations": ["Dacca", "Dhaka"],
                "bn_variations": ["ঢাকা", "ঢাকা জেলা", "রাজধানী", "রাজধানীর", "ঢাকা সিটি", "ডিএমপি", "গুলিস্থান", "গুলিস্তান", "ঢাকা সদর", "ডাকা", "ডাক্কা"],
                "upazilas": ["Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar", "Dhaka Sadar"]
            },
            {
                "name": "Gazipur",
                "bn_name": "গাজীপুর",
                "variations": ["Gazipur"],
                "bn_variations": ["গাজীপুর", "গাজিপুর", "গাজী পুর", "গাজি পুর", "গাজীপুর জেলা", "গাজিপুর জেলা"],
                "upazilas": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"]
            },
            {
                "name": "Narayanganj",
                "bn_name": "নারায়ণগঞ্জ",
                "variations": ["Narayanganj", "Narayangonj"],
                "bn_variations": ["নারায়ণগঞ্জ", "নারায়নগঞ্জ", "নারায়ণগঞ্জ", "নারায়ণ গঞ্জ", "নারায়ন গঞ্জ", "নারায়নগঞ্জ", "নারায়ানগঞ্জ", "নারায়নগন্জ"],
                "upazilas": ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"]
            },
            {
                "name": "Munshiganj",
                "bn_name": "মুন্সীগঞ্জ",
                "variations": ["Munshiganj", "Munshigonj", "Bikrampur"],
                "bn_variations": ["মুন্সিগঞ্জ", "মুন্সীগঞ্জ", "মুন্সিগন্জ", "মুন্সীগন্জ", "মুন্সি গঞ্জ", "বিক্রমপুর", "মুন্সিগঞ্জ জেলা"],
                "upazilas": ["Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"]
            },
            {
                "name": "Narsingdi",
                "bn_name": "নরসিংদী",
                "variations": ["Narsingdi", "Norsingdi"],
                "bn_variations": ["নরসিংদী", "নরসিংদি", "নরসিংধী", "নরসিংদি জেলা", "নরসিংদী জেলা", "নরসিনদী", "নর সিংদী"],
                "upazilas": ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"]
            },
            {
                "name": "Manikganj",
                "bn_name": "মানিকগঞ্জ",
                "variations": ["Manikganj", "Manikgonj"],
                "bn_variations": ["মানিকগঞ্জ", "মানিকগন্জ", "মানিক গঞ্জ", "মানিক গন্জ", "মানিকগঞ্জ জেলা", "মানিকগন্জ জেলা"],
                "upazilas": ["Daulatpur", "Ghior", "Harirampur", "Manikgonj Sadar", "Saturia", "Shivalaya", "Singair"]
            },
            {
                "name": "Tangail",
                "bn_name": "টাঙ্গাইল",
                "variations": ["Tangail"],
                "bn_variations": ["টাঙ্গাইল", "টাংগাইল", "টাঙাইল", "টাঙ্গাইল জেলা", "টাংগাইল জেলা", "তঙ্গাইল", "টানগাইল"],
                "upazilas": ["Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar"]
            },
            {
                "name": "Kishoreganj",
                "bn_name": "কিশোরগঞ্জ",
                "variations": ["Kishoreganj", "Kishorgonj", "Kishoregonj"],
                "bn_variations": ["কিশোরগঞ্জ", "কিশোরগন্জ", "কিশোর গঞ্জ", "কিশোর গন্জ", "কিসোরগঞ্জ", "কিশরগঞ্জ", "কিশোরগঞ্জ জেলা"],
                "upazilas": ["Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kishoreganj Sadar", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"]
            },
            {
                "name": "Faridpur",
                "bn_name": "ফরিদপুর",
                "variations": ["Faridpur"],
                "bn_variations": ["ফরিদপুর", "ফরিপুর", "ফরিদ পুর", "ফরিদপুর জেলা", "ফরিদ পুর জেলা"],
                "upazilas": ["Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Faridpur Sadar", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"]
            },
            {
                "name": "Gopalganj",
                "bn_name": "গোপালগঞ্জ",
                "variations": ["Gopalganj", "Gopalgonj"],
                "bn_variations": ["গোপালগঞ্জ", "গোপালগন্জ", "গোপাল গঞ্জ", "গোপাল গন্জ", "গোপালগঞ্জ জেলা", "গপালগঞ্জ"],
                "upazilas": ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"]
            },
            {
                "name": "Madaripur",
                "bn_name": "মাদারীপুর",
                "variations": ["Madaripur"],
                "bn_variations": ["মাদারীপুর", "মাদারিপুর", "মাদারি পুর", "মাদারী পুর", "মাদারীপুর জেলা", "মাদারিপুর জেলা"],
                "upazilas": ["Rajoir", "Madaripur Sadar", "Kalkini", "Shibchar", "Dasar"]
            },
            {
                "name": "Rajbari",
                "bn_name": "রাজবাড়ী",
                "variations": ["Rajbari"],
                "bn_variations": ["রাজবাড়ী", "রাজবাড়ি", "রাজ বারি", "রাজ বাড়ি", "রাজবাড়ী জেলা", "রাজবাড়ি জেলা"],
                "upazilas": ["Baliakandi", "Goalandaghat", "Pangsha", "Kalukhali", "Rajbari Sadar"]
            },
            {
                "name": "Shariatpur",
                "bn_name": "শরীয়তপুর",
                "variations": ["Shariatpur"],
                "bn_variations": ["শরীয়তপুর", "শরীয়তপুর", "শরিয়তপুর", "শরীয়ত পুর", "শরিয়ত পুর", "শরিয়তপুর", "শরিযতপুর", "শরীয়তপুর জেলা"],
                "upazilas": ["Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shariatpur Sadar", "Zajira", "Shakhipur"]
            }
        ]
    },
    {
        "division": "Sylhet",
        "districts": [
            {
                "name": "Sylhet",
                "bn_name": "সিলেট",
                "variations": ["Sylhet", "Sylet"],
                "bn_variations": ["সিলেট", "সিলেট জেলা", "ছিলট", "সিলট", "সিলেট সদর", "শ্রীহট্ট"],
                "upazilas": ["Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Sylhet Sadar", "Zakiganj", "Dakshin Surma", "Osmani Nagar"]
            },
            {
                "name": "Moulvibazar",
                "bn_name": "মৌলভীবাজার",
                "variations": ["Moulvibazar", "Maulvibazar", "Moulvi Bazar"],
                "bn_variations": ["মৌলভীবাজার", "মৌলভি বাজার", "মৌলভী বাজার", "মৌলবিবাজার", "মৌলভীবাজার জেলা", "মৌলবীবাজার"],
                "upazilas": ["Barlekha", "Juri", "Kamalganj", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal"]
            },
            {
                "name": "Habiganj",
                "bn_name": "হবিগঞ্জ",
                "variations": ["Habiganj", "Hobigonj", "Habigonj", "Hobiganj"],
                "bn_variations": ["হবিগঞ্জ", "হবিগন্জ", "হবি গঞ্জ", "হবীগঞ্জ", "হবি গন্জ", "হবিগঞ্জ জেলা", "হবিগন্জ জেলা"],
                "upazilas": ["Ajmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj", "Shayestaganj"]
            },
            {
                "name": "Sunamganj",
                "bn_name": "সুনামগঞ্জ",
                "variations": ["Sunamganj", "Sunamgonj"],
                "bn_variations": ["সুনামগঞ্জ", "সুনামগন্জ", "সুনাম গঞ্জ", "সুনাম গন্জ", "সুনামগঞ্জ জেলা", "সুনামগন্জ জেলা", "সুনাম"],
                "upazilas": ["Bishwamvarpur", "Chhatak", "Derai", "Dharmapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Sunamganj Sadar", "Tahirpur", "Shantiganj", "Madhyanagar"]
            }
        ]
    },
    {
        "division": "Rajshahi",
        "districts": [
            {
                "name": "Rajshahi",
                "bn_name": "রাজশাহী",
                "variations": ["Rajshahi"],
                "bn_variations": ["রাজশাহী", "রাজশাহি", "রাজ শাহী", "রাজশাহী জেলা", "রাজশাহি জেলা", "রাজশাহী সদর"],
                "upazilas": ["Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"]
            },
            {
                "name": "Bogura",
                "bn_name": "বগুড়া",
                "variations": ["Bogura", "Bogra"],
                "bn_variations": ["বগুড়া", "বগুরা", "বগরা", "বগুড়া জেলা", "বগুরা জেলা", "বগূড়া", "বগূরা"],
                "upazilas": ["Adamdighi", "Bogura Sadar", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala"]
            },
            {
                "name": "Pabna",
                "bn_name": "পাবনা",
                "variations": ["Pabna"],
                "bn_variations": ["পাবনা", "পাবনা জেলা", "পাবনা সদর", "পাবোনা"],
                "upazilas": ["Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Pabna Sadar", "Santhia", "Sujanagar"]
            },
            {
                "name": "Sirajganj",
                "bn_name": "সিরাজগঞ্জ",
                "variations": ["Sirajganj", "Sirajgonj"],
                "bn_variations": ["সিরাজগঞ্জ", "সিরাজগন্জ", "সিরাজ গঞ্জ", "সিরাজ গন্জ", "সিরাজগঞ্জ জেলা", "সিরাজগন্জ জেলা"],
                "upazilas": ["Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullahpara"]
            },
            {
                "name": "Naogaon",
                "bn_name": "নওগাঁ",
                "variations": ["Naogaon", "Naogan"],
                "bn_variations": ["নওগাঁ", "নওগা", "নউগা", "নওগাঁ জেলা", "নওগা জেলা", "নউগাঁ"],
                "upazilas": ["Atrai", "Badalgachhi", "Manda", "Dhamoirhat", "Mohadevpur", "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"]
            },
            {
                "name": "Natore",
                "bn_name": "নাটোর",
                "variations": ["Natore", "Nator"],
                "bn_variations": ["নাটোর", "নাটর", "নাটোর জেলা", "নাটর জেলা", "নাটোড়"],
                "upazilas": ["Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Natore Sadar", "Singra", "Naldanga"]
            },
            {
                "name": "Chapainawabganj",
                "bn_name": "চাঁপাইনবাবগঞ্জ",
                "variations": ["Chapainawabganj", "Chapai Nawabganj", "Nawabganj"],
                "bn_variations": ["চাঁপাইনবাবগঞ্জ", "চাপাইনবাবগঞ্জ", "চাপাই নবাবগঞ্জ", "নবাবগঞ্জ", "নবাবগন্জ", "চাপাই নবাবগন্জ", "চাঁপাই নবাবগঞ্জ", "চাঁপাই"],
                "upazilas": ["Bholahat", "Gomastapur", "Nachole", "Chapainawabganj Sadar", "Shibganj"]
            },
            {
                "name": "Joypurhat",
                "bn_name": "জয়পুরহাট",
                "variations": ["Joypurhat", "Jaipurhat"],
                "bn_variations": ["জয়পুরহাট", "জয়পুর হাট", "জয়পুরহাট জেলা", "জয়পুরহাট", "জয়পুর"],
                "upazilas": ["Akkelpur", "Joypurhat Sadar", "Kalai", "Khetlal", "Panchbibi"]
            }
        ]
    },
    {
        "division": "Khulna",
        "districts": [
            {
                "name": "Khulna",
                "bn_name": "খুলনা",
                "variations": ["Khulna"],
                "bn_variations": ["খুলনা", "খুলনা জেলা", "খুলনা সদর", "খূলনা"],
                "upazilas": ["Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Rupsha", "Terokhada"]
            },
            {
                "name": "Jashore",
                "bn_name": "যশোর",
                "variations": ["Jashore", "Jessore"],
                "bn_variations": ["যশোর", "যশর", "জশোর", "যশোর জেলা", "যশহর", "যশোর সদর"],
                "upazilas": ["Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Jashore Sadar", "Manirampur", "Sharsha"]
            },
            {
                "name": "Satkhira",
                "bn_name": "সাতক্ষীরা",
                "variations": ["Satkhira", "Satkhira Sadar"],
                "bn_variations": ["সাতক্ষীরা", "সাতক্ষিরা", "সাতক্ষীরা জেলা", "সাতক্ষিরা জেলা", "সাতখিরা", "সাতক্ষির"],
                "upazilas": ["Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Satkhira Sadar", "Shyamnagar", "Tala"]
            },
            {
                "name": "Bagerhat",
                "bn_name": "বাগেরহাট",
                "variations": ["Bagerhat"],
                "bn_variations": ["বাগেরহাট", "বাগের হাট", "বাগেরহাট জেলা", "বাগের হাট জেলা", "বাগেরহাটের", "বাগের"],
                "upazilas": ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"]
            },
            {
                "name": "Kushtia",
                "bn_name": "কুষ্টিয়া",
                "variations": ["Kushtia"],
                "bn_variations": ["কুষ্টিয়া", "কুষ্টিয়া", "কুশটিয়া", "কুস্টুয়া", "কুষ্টিয়া জেলা", "কুষ্টিয়া জেলা"],
                "upazilas": ["Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur"]
            },
            {
                "name": "Jhenaidah",
                "bn_name": "ঝিনাইদহ",
                "variations": ["Jhenaidah", "Jhenidah"],
                "bn_variations": ["ঝিনাইদহ", "ঝিনাইদহ্", "ঝিনাইদহ সদর", "ঝিনাইদহ জেলা", "ঝিনাইদা", "ঝিনাইদাহ", "ঝিনাইদহা"],
                "upazilas": ["Harinakunda", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"]
            },
            {
                "name": "Chuadanga",
                "bn_name": "চুয়াডাঙ্গা",
                "variations": ["Chuadanga", "Chowadanga"],
                "bn_variations": ["চুয়াডাঙ্গা", "চুয়াডাঙ্গা", "চুয়াডানগা", "চুয়াডাঙ্গা জেলা", "চুয়াডাঙ্গা জেলা", "চুয়াডাজ্ঞা"],
                "upazilas": ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"]
            },
            {
                "name": "Meherpur",
                "bn_name": "মেহেরপুর",
                "variations": ["Meherpur"],
                "bn_variations": ["মেহেরপুর", "মেহের পুর", "মেহেরপুর জেলা", "মেহের পুর জেলা"],
                "upazilas": ["Gangni", "Meherpur Sadar", "Mujibnagar"]
            },
            {
                "name": "Narail",
                "bn_name": "নড়াইল",
                "variations": ["Narail"],
                "bn_variations": ["নড়াইল", "নড়াইল জেলা", "নড়াইল", "নরাইল", "নড়াইল সদর"],
                "upazilas": ["Kalia", "Lohagara", "Narail Sadar"]
            },
            {
                "name": "Magura",
                "bn_name": "মাগুরা",
                "variations": ["Magura"],
                "bn_variations": ["মাগুরা", "মাগুড়া", "মাগুরা জেলা", "মাগুড়া জেলা"],
                "upazilas": ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"]
            }
        ]
    },
    {
        "division": "Barishal",
        "districts": [
            {
                "name": "Barishal",
                "bn_name": "বরিশাল",
                "variations": ["Barishal", "Barisal"],
                "bn_variations": ["বরিশাল", "বরিশাল সদর", "বরিশাল জেলা", "বরিষাল", "বরিশাল্লা"],
                "upazilas": ["Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Barishal Sadar", "Mehendiganj", "Muladi", "Wazirpur"]
            },
            {
                "name": "Patuakhali",
                "bn_name": "পটুয়াখালী",
                "variations": ["Patuakhali"],
                "bn_variations": ["পটুয়াখালী", "পটুয়াখালি", "পটুয়াখালী", "পটুয়াখালি", "পটুয়াখালী জেলা", "পটুয়াখালি জেলা"],
                "upazilas": ["Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Patuakhali Sadar", "Rangabali", "Dumki"]
            },
            {
                "name": "Bhola",
                "bn_name": "ভোলা",
                "variations": ["Bhola"],
                "bn_variations": ["ভোলা", "ভোলা জেলা", "ভোলা সদর", "ভলা"],
                "upazilas": ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"]
            },
            {
                "name": "Pirojpur",
                "bn_name": "পিরোজপুর",
                "variations": ["Pirojpur"],
                "bn_variations": ["পিরোজপুর", "পিরজপুর", "পিরোজ পুর", "পিরোজপুর জেলা", "পিরজপুর জেলা", "পিরোজ পুর জেলা"],
                "upazilas": ["Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Pirojpur Sadar", "Nesarabad"]
            },
            {
                "name": "Barguna",
                "bn_name": "বরগুনা",
                "variations": ["Barguna"],
                "bn_variations": ["বরগুনা", "বরগুনা জেলা", "বরগুনা সদর", "বরগুণা", "বরগূনা"],
                "upazilas": ["Amtali", "Bamna", "Barguna Sadar", "Betagi", "Patharghata", "Taltali"]
            },
            {
                "name": "Jhalokati",
                "bn_name": "ঝালকাঠি",
                "variations": ["Jhalokati", "Jhalakathi"],
                "bn_variations": ["ঝালকাঠি", "ঝালকাঠী", "ঝালকাটি", "ঝালকাটী", "ঝালকাঠি জেলা", "ঝালকাঠী জেলা"],
                "upazilas": ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"]
            }
        ]
    },
    {
        "division": "Rangpur",
        "districts": [
            {
                "name": "Rangpur",
                "bn_name": "রংপুর",
                "variations": ["Rangpur"],
                "bn_variations": ["রংপুর", "রংপুর জেলা", "রংপুর সদর", "রঙপুর"],
                "upazilas": ["Badarganj", "Gangachhara", "Kaunia", "Rangpur Sadar", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"]
            },
            {
                "name": "Dinajpur",
                "bn_name": "দিনাজপুর",
                "variations": ["Dinajpur"],
                "bn_variations": ["দিনাজপুর", "দিনাজ পুর", "দিনাজপুর জেলা", "দিনাজ পুর জেলা", "দিনাজপুর সদর"],
                "upazilas": ["Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Dinajpur Sadar", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur", "Fulbari"]
            },
            {
                "name": "Gaibandha",
                "bn_name": "গাইবান্ধা",
                "variations": ["Gaibandha"],
                "bn_variations": ["গাইবান্ধা", "গাইবান্দা", "গায়বান্ধা", "গাইবান্ধা জেলা", "গাইবান্ধা সদর"],
                "upazilas": ["Fulchhari", "Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur", "Sughatta", "Sundarganj"]
            },
            {
                "name": "Kurigram",
                "bn_name": "কুড়িগ্রাম",
                "variations": ["Kurigram"],
                "bn_variations": ["কুড়িগ্রাম", "কুড়িগ্রাম", "কুড়িগ্রাম জেলা", "কুড়ি গ্রাম", "কুড়িগ্রাম সদর"],
                "upazilas": ["Bhurungamari", "Char Rajibpur", "Chilmari", "Phulbari", "Kurigram Sadar", "Nageshwari", "Rajarhat", "Raomari", "Ulipur"]
            },
            {
                "name": "Nilphamari",
                "bn_name": "নীলফামারী",
                "variations": ["Nilphamari"],
                "bn_variations": ["নীলফামারী", "নিলফামারী", "নীলফামারি", "নিলফামারি", "নীলফামারী জেলা", "নিলফামারি জেলা", "নীল ফামারী"],
                "upazilas": ["Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Nilphamari Sadar", "Saidpur"]
            },
            {
                "name": "Lalmonirhat",
                "bn_name": "লালমনিরহাট",
                "variations": ["Lalmonirhat"],
                "bn_variations": ["লালমনিরহাট", "লালমনিহাট", "লালমনির হাট", "লালমনিরহাট জেলা", "লালমনি হাট", "লালমনি"],
                "upazilas": ["Aditmari", "Hatibandha", "Kaliganj", "Lalmonirhat Sadar", "Patgram"]
            },
            {
                "name": "Panchagarh",
                "bn_name": "পঞ্চগড়",
                "variations": ["Panchagarh", "Panchagar"],
                "bn_variations": ["পঞ্চগড়", "পঞ্চগর", "পন্চগড়", "পঞ্চগড়", "পঞ্চগড় জেলা", "পঞ্চগর জেলা"],
                "upazilas": ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tetulia"]
            },
            {
                "name": "Thakurgaon",
                "bn_name": "ঠাকুরগাঁও",
                "variations": ["Thakurgaon"],
                "bn_variations": ["ঠাকুরগাঁও", "ঠাকুরগাও", "ঠাকুরগাঁও জেলা", "ঠাকুরগাও জেলা", "ঠাকুর গাও", "ঠাকুর গাঁও"],
                "upazilas": ["Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar"]
            }
        ]
    },
    {
        "division": "Mymensingh",
        "districts": [
            {
                "name": "Mymensingh",
                "bn_name": "ময়মনসিংহ",
                "variations": ["Mymensingh", "Mymensing"],
                "bn_variations": ["ময়মনসিংহ", "ময়মনসিং", "মায়মনসিংহ", "মইমনসিংহ", "ময়মনসিংহ জেলা", "ময়মনসিং জেলা", "ময়মনসিংহ সদর"],
                "upazilas": ["Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Mymensingh Sadar", "Muktagachha", "Nandail", "Phulpur", "Trishal", "Tara Khanda", "ভালুকা", "গফরগাঁও", "ত্রিশাল", "ফুলপুর", "ঈশ্বরগঞ্জ", "মুক্তাগাছা", "ধোবাউড়া", "হালুয়াঘাট", "নান্দাইল", "ফুলবাড়িয়া"]
            },
            {
                "name": "Jamalpur",
                "bn_name": "জামালপুর",
                "variations": ["Jamalpur"],
                "bn_variations": ["জামালপুর", "জামাল পুর", "জামালপুর জেলা", "জামাল পুর জেলা", "জামালপুর সদর"],
                "upazilas": ["Bakshiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandaha", "Sarishabari"]
            },
            {
                "name": "Sherpur",
                "bn_name": "শেরপুর",
                "variations": ["Sherpur"],
                "bn_variations": ["শেরপুর", "শের পুর", "শেরপুর জেলা", "শের পুর জেলা", "শেরপুর সদর"],
                "upazilas": ["Jhenaigati", "Nakla", "Nalitabari", "Sherpur Sadar", "Sreebardi"]
            },
            {
                "name": "Netrokona",
                "bn_name": "নেত্রকোণা",
                "variations": ["Netrokona", "Netrakona"],
                "bn_variations": ["নেত্রকোণা", "নেত্রকোনা", "নেত্র কোনা", "নেত্র কোণা", "নেত্রকোনা জেলা", "নেত্রকোণা জেলা", "নেত্রকোনা সদর"],
                "upazilas": ["Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala"]
            }
        ]
    }
]

// Build lookup map: normalized_term -> canonical_bn_name
const SEARCH_INDEX: Map<string, string> = new Map()

// Init search index
DISTRICT_DATA.forEach(div => {
    div.districts.forEach(dist => {
        let targetKey = dist.bn_name

        // Normalize targetKey to match bangladeshDistricts keys
        // Fix for Unicode mismatches (e.g. Kurigram ড় vs ড়)
        if (!bangladeshDistricts[targetKey]) {
            // Check for normalized match
            const normalizedTarget = targetKey.normalize('NFC')
            const matchedKey = Object.keys(bangladeshDistricts).find(k => k.normalize('NFC') === normalizedTarget)

            if (matchedKey) {
                targetKey = matchedKey
            } else {
                // Try loose matching (substring)
                const fuzzyMatch = Object.keys(bangladeshDistricts).find(k => k === targetKey || k.includes(targetKey.substring(0, 3)))
                if (fuzzyMatch) targetKey = fuzzyMatch
            }
        }

        const terms = [
            dist.name,
            dist.bn_name,
            ...(dist.variations || []),
            ...(dist.bn_variations || []),
            ...(dist.upazilas || [])
        ]

        terms.forEach(t => {
            if (t) SEARCH_INDEX.set(t.toLowerCase().trim(), targetKey)
        })
    })
})


// Reverse Map: Bangla Name -> English Canonical Name
export const BN_TO_EN_DISTRICTS: { [key: string]: string } = {}

// Populate reverse map
Object.entries(bangladeshDistricts).forEach(([bnName, _]) => {
    // Find the English name from the key in bangladeshDistricts?
    // Wait, bangladeshDistricts keys ARE Bangla.
    // We need to look up in user dataset or inferred.

    // Let's create a manual reverse map based on the DISTRICT_DATA structure above.
    // Or we can infer it if we trust the dataset.
})

// We can just use the DISTRICTS_BN_MAP from constants.ts if we imported it, but we can't easily import here without risk of circular dep or file access.
// Let's simplify: We want geocodeLocation to return English.
// We have DISTRICT_DATA.

const DIST_TRANSLATION: Map<string, string> = new Map()
DISTRICT_DATA.forEach(div => {
    div.districts.forEach(dist => {
        // Key: Bangla Name (as used in bangladeshDistricts keys) -> Value: English Name
        if (dist.bn_name) DIST_TRANSLATION.set(dist.bn_name, dist.name)

        // Also map variations just in case
        // dist.bn_variations.forEach(v => DIST_TRANSLATION.set(v, dist.name)) // Not needed if we resolve to key first
    })
})

/**
 * Geocode a location string to coordinates
 * @param locationText - Location string from article (can be in Bangla or English)
 * @returns { lat, lng, district } or null if not found
 */
export function geocodeLocation(locationText: string): { lat: number; lng: number; district: string } | null {
    if (!locationText) return null

    const input = locationText.toLowerCase().trim()
    let foundKey: string | null = null

    // 1. Direct match in Search Index (fast O(1))
    if (SEARCH_INDEX.has(input)) {
        foundKey = SEARCH_INDEX.get(input)!
    }

    // 2. Partial match (O(N))
    if (!foundKey) {
        for (const [term, key] of SEARCH_INDEX.entries()) {
            if (input.includes(term)) {
                foundKey = key
                break
            }
        }
    }

    // 3. Last resort
    if (!foundKey) {
        for (const [district, _] of Object.entries(bangladeshDistricts)) {
            if (locationText.includes(district)) {
                foundKey = district
                break
            }
        }
    }

    if (foundKey && bangladeshDistricts[foundKey]) {
        const coords = bangladeshDistricts[foundKey]
        // TRANSLATE TO ENGLISH HERE
        const englishName = DIST_TRANSLATION.get(foundKey) || foundKey // Fallback to key (Bangla) if missing, but shouldn't happen with full map

        return { ...coords, district: englishName }
    }

    // If no match found, strictly return null. 
    console.warn(`Could not geocode location: ${locationText}`)
    return null
}

