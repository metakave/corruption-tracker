
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PARTIES = [
    'bnp', 'awami league', 'awami', 'league', 'jamaat', 'jatiya party', 'jp',
    'shibir', 'chhatra league', 'chatra league', 'bcl', 'jubo league', 'jl', 'jubo dal', 'jd',
    'chhatra dal', 'cd', 'swechasebak', 'police', 'rab', 'ansar', 'hefazat', 'communist',
    'বিএনপি', 'আওয়ামী লীগ', 'আওয়ামী', 'লীগ', 'জামায়াত', 'জাতীয় পার্টি',
    'শিবির', 'ছাত্রলীগ', 'যুবলীগ', 'যুবদল', 'ছাত্রদল', 'স্বেচ্ছাসেবক', 'পুলিশ', 'হেফাজত'
];

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractRoles(text: string, existingParties?: string[]): { victims: string[], perpetrators: string[] } {
    text = text.toLowerCase();
    const victims: Set<string> = new Set();
    const perpetrators: Set<string> = new Set();
    const mutual: Set<string> = new Set();

    // 1. CLASH / MUTUAL
    const mutualPatterns = [
        /(?:clash|fight|shonghorsho|dhaoa|chase|battle|gunfight) between (.+?) and (.+?)(?: |$)/,
        /(?:সংঘর্ষ|ধাওয়া|পাল্টাপাল্টি).+? (.+?) (?:ও|বনাম) (.+?)/,
        /(.+?) (?:ও|এবং|vs) (.+?) (?:এর|র)? মধ্যে (?:সংঘর্ষ|ধাওয়া|গণ্ডগোল)/
    ];
    for (const pat of mutualPatterns) {
        const match = text.match(pat);
        if (match) {
            const p1 = match[1].trim(); const p2 = match[2].trim();
            if (containsParty(p1)) mutual.add(extractPartyName(p1));
            if (containsParty(p2)) mutual.add(extractPartyName(p2));
        }
    }

    // 1.5 Explicit Parties + "Clash" Keyword -> Mutual
    const isClash = text.includes('clash') || text.includes('সংঘর্ষ') || text.includes('dhaoa') || text.includes('tension') || text.includes('violence');
    if (isClash && existingParties && existingParties.length >= 2) {
        existingParties.forEach(p => mutual.add(extractPartyName(p)));
    }

    // 2. ACTIVE ATTACK (X attacked Y)
    const activePatterns = [
        /(.+?) (?:activists? )?(?:attacked|beat|stabbed|hacked|chased|fired at|shot at) (.+?)(?: |$)/,
        /(.+?) (?:activists? )?(?:vandalized|torched|burned) (?:office of |house of )?(.+?)(?: |$)/,
        /(.+?) (?:কর্মীরা|সমর্থকরা|নেতারা)? (?:হামলা|মারধর|ভাংচুর|আগুন) (?:করে|চালিয়ে|দিয়েছে) (.+?)/
    ];
    for (const pat of activePatterns) {
        const match = text.match(pat);
        if (match) {
            const perp = match[1].trim(); const vic = match[2].trim();
            if (containsParty(perp)) perpetrators.add(extractPartyName(perp));
            if (containsParty(vic)) victims.add(extractPartyName(vic));
        }
    }

    // 3. PASSIVE ATTACK (X attacked by Y)
    const passivePatterns = [
        /(.+?) (?:activists? )?(?:was|were) (?:attacked|beaten|stabbed|shot|hacked|chased) by (.+?)(?: |$)/
    ];
    for (const pat of passivePatterns) {
        const match = text.match(pat);
        if (match) {
            const vic = match[1].trim(); const perp = match[2].trim();
            if (containsParty(vic)) victims.add(extractPartyName(vic));
            if (containsParty(perp)) perpetrators.add(extractPartyName(perp));
        }
    }

    // 4. POLICE ACTION
    if (text.includes('police') || text.includes('পুলিশ') || text.includes('rab') || text.includes(' র‌্যাব')) {
        const policePatterns = [
            /(?:police|পুলিশ|rab|র‌্যাব) (?:charged|fired|dispersed|arrested|detained|raided|sued|filed case|আটক|গ্রেপ্তার|রাবার বুলেট|হামলা) (.+?)(?: |$)/
        ];
        for (const pat of policePatterns) {
            const match = text.match(pat);
            if (match) {
                const vic = match[1].trim();
                if (containsParty(vic)) { victims.add(extractPartyName(vic)); perpetrators.add('police'); }
            }
        }
    }

    // 5. VICTIM FOCUS (Broadened)
    const victimPatterns = [
        /(.+?) (?:activist|leader|worker|supporter|member|man|men) (?:killed|injured|shot|stabbed|murdered|sued|accused|arrested|detained|jailed)/,
        /(.+?) (?:was|were) (?:arrested|detained|sued|jailed|sentenced|remanded)/,
        /(.+?) (?:office|residence|house|procession|rally|meeting) (?:vandalized|torched|attacked|foiled|blocked)/,
        /(?:arrest|detention|remand|jail) of (.+?)/,
        /(?:case|lawsuit) (?:filed )?against (.+?)/,
        /(.+?) (?:নেতা|কর্মী|সমর্থক) (?:নিহত|আহত|গুলিবিদ্ধ|খুন|আটক|গ্রেপ্তার|মামলা)/,
        /(.+?) (?:অফিস|কার্যালয়|বাড়ি|মিছিল|সমাবেশ) (?:ভাংচুর|আগুন|হামলা|পণ্ড)/
    ];
    for (const pat of victimPatterns) {
        const match = text.match(pat);
        if (match) {
            const vic = match[1].trim();
            if (containsParty(vic)) victims.add(extractPartyName(vic));
        }
    }

    // 6. LOOSE MATCHING (Keywords)
    if (existingParties) {
        existingParties.forEach(pRaw => {
            const pName = extractPartyName(pRaw);
            const vicKeywords = ['arrest', 'detain', 'sue', 'case', 'jail', 'remand', 'attack', 'injure', 'kill', 'die', 'body', 'corpse', 'shot', 'stab', 'beat', 'clahs'];
            const hasVicKey = vicKeywords.some(k => text.includes(k));

            if (text.includes(pRaw.toLowerCase()) || text.includes(pName.toLowerCase())) {
                if (hasVicKey) {
                    if (!perpetrators.has(pName)) {
                        victims.add(pName);
                    }
                }
            }
        });
    }

    mutual.forEach(p => { victims.add(p); perpetrators.add(p); });

    return { victims: Array.from(victims), perpetrators: Array.from(perpetrators) };
}

function containsParty(phrase: string): boolean {
    return PARTIES.some(p => phrase.toLowerCase().includes(p));
}

function extractPartyName(phrase: string): string {
    const lower = phrase.toLowerCase();

    // BNP & Affiliates (English & Bengali)
    if (lower.includes('bnp') || lower.includes('jubo') || lower.includes('chhatra dal') || lower.includes('chatra dal') || lower.includes('student dal') || lower.includes('jcd') || lower.includes('jd') || lower.includes('swechasebak') || lower.includes('juba') ||
        lower.includes('বিএনপি') || lower.includes('যুব') || lower.includes('ছাত্রদল') || lower.includes('স্বেচ্ছাসেবক')) {
        return 'BNP';
    }

    // Awami League & Affiliates (English & Bengali)
    if (lower.includes('awami') || lower.includes('league') || lower.includes('bcl') || lower.includes('chhatra league') || lower.includes('chatra league') || lower.includes('jl') ||
        lower.includes('আওয়ামী') || lower.includes('লীগ') || lower.includes('ছাত্রলীগ') || lower.includes('যুবলীগ')) {
        return 'Awami League';
    }

    // Jamaat (English & Bengali)
    if (lower.includes('jamaat') || lower.includes('shibir') || lower.includes('জামায়াত') || lower.includes('শিবির')) {
        return 'Jamaat-Shibir';
    }

    // Police
    if (lower.includes('police') || lower.includes('rab') || lower.includes('ansar') || lower.includes('পুলিশ') || lower.includes('র‌্যাব')) {
        return 'Police';
    }

    // Jatiya Party
    if (lower.includes('jatiya') || lower.includes('jp') || lower.includes('ershad') || lower.includes('জাতীয় পার্টি')) {
        return 'Jatiya Party';
    }

    // Fallback?
    const found = PARTIES.find(p => lower.includes(p));
    if (found) return found.charAt(0).toUpperCase() + found.slice(1);

    return phrase;
}

async function main() {
    console.log("🚀 Starting Party Role Analysis (Merged)...");
    const events = await prisma.politicalEvent.findMany();
    let updatedCount = 0;

    for (const event of events) {
        const text = (event.title || '') + ' ' + (event.summary || '');
        let existingParties: string[] = [];
        try {
            if (event.politicalParties) {
                existingParties = typeof event.politicalParties === 'string' ? JSON.parse(event.politicalParties) : event.politicalParties;
            }
        } catch { existingParties = []; }

        const { victims, perpetrators } = extractRoles(text, existingParties);

        if (victims.length > 0 || perpetrators.length > 0) {
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    victimParties: JSON.stringify(victims),
                    perpetratorParties: JSON.stringify(perpetrators)
                }
            });
            updatedCount++;
        }
    }
    console.log(`\n✅ Role Analysis Complete. Updated ${updatedCount} events.`);
}

main()
    .catch(console.error)
    .finally(async () => { await prisma.$disconnect(); });
