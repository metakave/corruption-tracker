
export const DISTRICTS_BN_MAP: Record<string, string> = {
    "Bagerhat": "বাগেরহাট",
    "Bandarban": "বান্দরবান",
    "Barguna": "বরগুনা",
    "Barishal": "বরিশাল",
    "Bhola": "ভোলা",
    "Bogura": "বগুড়া",
    "Brahmanbaria": "ব্রাহ্মণবাড়িয়া",
    "Chandpur": "চাঁদপুর",
    "Chapai Nawabganj": "চাঁপাইনবাবগঞ্জ",
    "Chattogram": "চট্টগ্রাম",
    "Chuadanga": "চুয়াডাঙ্গা",
    "Cumilla": "কুমিল্লা",
    "Cox's Bazar": "কক্সবাজার",
    "Dhaka": "ঢাকা",
    "Dinajpur": "দিনাজপুর",
    "Faridpur": "ফরিদপুর",
    "Feni": "ফেনী",
    "Gaibandha": "গাইবান্ধা",
    "Gazipur": "গাজীপুর",
    "Gopalganj": "গোপালগঞ্জ",
    "Habiganj": "হবিগঞ্জ",
    "Jamalpur": "জামালপুর",
    "Jashore": "যশোর",
    "Jhalokati": "ঝালকাঠি",
    "Jhenaidah": "ঝিনাইদহ",
    "Joypurhat": "জয়পুরহাট",
    "Khagrachhari": "খাগড়াছড়ি",
    "Khulna": "খুলনা",
    "Kishoreganj": "কিশোরগঞ্জ",
    "Kurigram": "কুড়িগ্রাম",
    "Kushtia": "কুষ্টিয়া",
    "Lakshmipur": "লক্ষ্মীপুর",
    "Lalmonirhat": "লালমনিরহাট",
    "Madaripur": "মাদারীপুর",
    "Magura": "মাগুরা",
    "Manikganj": "মানিকগঞ্জ",
    "Meherpur": "মেহেরপুর",
    "Moulvibazar": "মৌলভীবাজার",
    "Munshiganj": "মুন্সীগঞ্জ",
    "Mymensingh": "ময়মনসিংহ",
    "Naogaon": "নওগাঁ",
    "Narail": "নড়াইল",
    "Narayanganj": "নারায়ণগঞ্জ",
    "Narsingdi": "নরসিংদী",
    "Natore": "নাটোর",
    "Netrokona": "নেত্রকোনা",
    "Nilphamari": "নীলফামারী",
    "Noakhali": "নোয়াখালী",
    "Pabna": "পাবনা",
    "Panchagarh": "পঞ্চগড়",
    "Patuakhali": "পটুয়াখালী",
    "Pirojpur": "পিরোজপুর",
    "Rajbari": "রাজবাড়ী",
    "Rajshahi": "রাজশাহী",
    "Rangamati": "রাঙ্গামাটি",
    "Rangpur": "রংপুর",
    "Satkhira": "সাতক্ষীরা",
    "Shariatpur": "শরীয়তপুর",
    "Sherpur": "শেরপুর",
    "Sirajganj": "সিরাজগঞ্জ",
    "Sunamganj": "সুনামগঞ্জ",
    "Sylhet": "সিলেট",
    "Tangail": "টাঙ্গাইল",
    "Thakurgaon": "ঠাকুরগাঁও"
};

export const BD_DISTRICTS = Object.keys(DISTRICTS_BN_MAP).sort();

export const PARTY_CATEGORIES = [
    {
        id: "awami_league",
        label: "Awami League & Affiliates",
        keywords: [
            "Awami League", "Chhatra League", "BCL", "Juba League", "Swechasebak League", "Sramik League", "Krishak League", "Mohila Awami League",
            "আওয়ামী লীগ", "ছাত্রলীগ", "যুবলীগ", "স্বেচ্ছাসেবক লীগ", "শ্রমিক লীগ", "কৃষক লীগ", "মহিলা আওয়ামী লীগ"
        ]
    },
    {
        id: "bnp",
        label: "BNP & Affiliates",
        keywords: [
            "Bangladesh Nationalist Party", "BNP", "JCD", "Chhatra Dal", "Jatiyatabadi Chhatra Dal", "Juba Dal", "Swechasebak Dal", "Sramik Dal", "Mohila Dal", "Krishak Dal",
            "বিএনপি", "ছাত্রদল", "জাতীয়তাবাদী ছাত্রদল", "যুবদল", "স্বেচ্ছাসেবক দল", "শ্রমিক দল", "মহিলা দল", "কৃষক দল"
        ]
    },
    {
        id: "jamaat",
        label: "Jamaat-e-Islami & Shibir",
        keywords: [
            "Jamaat-e-Islami", "Jamaat", "Shibir", "Islami Chhatra Shibir", "ICS",
            "জামায়াত", "শিবির", "ইসলামী ছাত্রশিবির"
        ]
    },
    {
        id: "jatiya_party",
        label: "Jatiya Party (All Factions)",
        keywords: [
            "Jatiya Party", "Ershad", "Manju",
            "জাতীয় পার্টি", "জাপা", "এরশাদ", "মঞ্জু"
        ]
    },
    {
        id: "islamist_other",
        label: "Other Islamist Parties",
        keywords: [
            "Islami Andolan", "IAB", "Khelafat", "Hefazat", "Islamic Front", "Tarikat", "Jamiat",
            "ইসলামী আন্দোলন", "খেলাফত", "হেফাজত", "ইসলামিক ফ্রন্ট", "তরিকত", "জমিয়ত"
        ]
    },
    {
        id: "left_parties",
        label: "Left / Socialist Parties",
        keywords: [
            "CPB", "Communist Party", "Workers Party", "JSD", "BASAD", "Samajtantrik", "Ganosamhati", "Biplobi", "Student Union", "Chhatra Union", "Somajtantrik",
            "সিপিবি", "কমিউনিস্ট পার্টি", "ওয়ার্কার্স পার্টি", "জাসদ", "বাসদ", "সমাজতান্ত্রিক", "গণসংহতি", "বিপ্লবী", "ছাত্র ইউনিয়ন"
        ]
    },
    {
        id: "extremist",
        label: "Extremist / Criminal / Unidentified",
        keywords: [
            "Extremist", "Militant", "Terrorist", "Miscreants", "Criminals", "Attackers", "Unidentified", "Unknown", "Assailants", "Thugs", "Armed group",
            "জঙ্গি", "উগ্রপন্থী", "সন্ত্রাসী", "দুর্বৃত্ত", "দুষ্কৃতিকারী", "হামলাকারী", "অজ্ঞাত", "অচেনা", "ডাকাত", "সশস্ত"
        ]
    },
    {
        id: "ncp",
        label: "NCP (Jatiya Nagorik Party)",
        keywords: [
            "NCP", "Jatiya Nagorik Party", "Nagorik Party",
            "এনসিপি", "জাতীয় নাগরিক পার্টি", "নাগরিক পার্টি"
        ]
    },
    {
        id: "non_party",
        label: "Non-Party / Civil / State",
        keywords: [
            "Student", "Students", "Teacher", "Quota", "Protest", "Protester", "Mob", "Local", "Villager", "Public", "Administration", "Police", "RAB", "Ansar", "Law Enforcement", "Transport Worker", "Rickshaw", "Shopkeeper",
            "ছাত্র", "শিক্ষার্থী", "শিক্ষক", "কোটা", "আন্দোলন", "বিক্ষোভকারী", "জনতা", "গ্রামবাসী", "এলাকাবাসী", "প্রশাসন", "পুলিশ", "র‍্যাব", "আনসার", "আইনশৃঙ্খলা", "শ্রমিক", "রিকশা", "দোকানদার", "সাধারণ মানুষ"
        ]
    }
];
