
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PARTIES = [
    'bnp', 'awami league', 'awami', 'league', 'jamaat', 'jatiya party', 'jp',
    'shibir', 'chhatra league', 'chatra league', 'bcl', 'jubo league', 'jl', 'jubo dal', 'jd',
    'chhatra dal', 'cd', 'swechasebak', 'police', 'rab', 'ansar', 'hefazat', 'communist',
    'বিএনপি', 'আওয়ামী লীগ', 'আওয়ামী', 'লীগ', 'জামায়াত', 'জাতীয় পার্টি',
    'শিবির', 'ছাত্রলীগ', 'যুবলীগ', 'যুবদল', 'ছাত্রদল', 'স্বেচ্ছাসেবক', 'পুলিশ', 'হেফাজত',
    'বাম', 'left alliance', 'cpb', 'bsad'
];

interface PartyStats {
    total: number;
    victim: number;
    perpetrator: number;
}

const stats: Record<string, PartyStats> = {};

function initStats(party: string) {
    if (!stats[party]) stats[party] = { total: 0, victim: 0, perpetrator: 0 };
}

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractRoles(text: string, existingParties?: string[]): { victims: string[], perpetrators: string[] } {
    text = text.toLowerCase();

    // EXCLUSION: Skip "effigy" or "symbolic" violence
    if (text.includes('effigy') || text.includes('কুশপুত্তলিকা')) {
        return { victims: [], perpetrators: [] };
    }

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
    const isClash = text.includes('clash') || text.includes('সংঘর্ষ') || text.includes('dhaoa') || text.includes('tension') || text.includes('violence') || text.includes('পাল্টাপাল্টি');
    if (isClash && existingParties && existingParties.length >= 2) {
        existingParties.forEach(p => mutual.add(extractPartyName(p)));
    }

    // 2. ACTIVE ATTACK (X attacked Y)
    const activePatterns = [
        /(.+?) (?:activists? )?(?:attacked|beat|stabbed|hacked|chased|fired at|shot at) (.+?)(?: |$)/,
        /(.+?) (?:activists? )?(?:vandalized|torched|burned) (?:office of |house of )?(.+?)(?: |$)/,
        /(.+?) (?:কর্মীরা|সমর্থকরা|নেতারা)? (?:হামলা|মারধর|ভাংচুর|আগুন|গুলি) (?:করে|চালিয়ে|দিয়েছে) (.+?)/,
        /(.+?) (?:members? )?(?:attacked|injured) (.+?)/
    ];
    for (const pat of activePatterns) {
        const match = text.match(pat);
        if (match) {
            const perp = match[1].trim(); const vic = match[2].trim();
            if (containsParty(perp) && containsParty(vic)) {
                perpetrators.add(extractPartyName(perp));
                victims.add(extractPartyName(vic));
            } else if (containsParty(perp)) {
                perpetrators.add(extractPartyName(perp));
            } else if (containsParty(vic)) {
                victims.add(extractPartyName(vic));
            }
        }
    }

    // 3. PASSIVE ATTACK (X attacked by Y)
    const passivePatterns = [
        /(.+?) (?:activists? )?(?:was|were) (?:attacked|beaten|stabbed|shot|hacked|chased) by (.+?)(?: |$)/,
        /(.+?) (?:উপর|ওপর) হামলা (?:চালিয়েছে|করেছে) (.+?)/
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
            /(?:police|পুলিশ|rab|র‌্যাব) (?:charged|fired|dispersed|arrested|detained|raided|sued|filed case|আটক|গ্রেপ্তার|রাবার বুলেট|হামলা|গুলি) (.+?)(?: |$)/
        ];
        for (const pat of policePatterns) {
            const match = text.match(pat);
            if (match) {
                const vic = match[1].trim();
                if (containsParty(vic)) { victims.add(extractPartyName(vic)); perpetrators.add('Police'); }
            }
        }
    }

    // 5. VICTIM FOCUS keywords
    if (existingParties) {
        existingParties.forEach(pRaw => {
            const pName = extractPartyName(pRaw);
            const vicKeywords = ['arrest', 'detain', 'sue', 'case', 'jail', 'remand', 'attack', 'injure', 'kill', 'die', 'body', 'corpse', 'shot', 'stab', 'beat', 'clahs', 'আহত', 'নিহত', 'হামলা', 'ভাংচুর', 'আগুন', 'গ্রেপ্তার', 'আটক', 'মামলা'];
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

    if (lower.includes('bnp') || lower.includes('jubo') || lower.includes('chhatra dal') || lower.includes('chatra dal') || lower.includes('student dal') || lower.includes('jcd') || lower.includes('jd') || lower.includes('swechasebak') || lower.includes('juba') ||
        lower.includes('বিএনপি') || lower.includes('যুব') || lower.includes('ছাত্রদল') || lower.includes('স্বেচ্ছাসেবক')) return 'BNP';

    if (lower.includes('awami') || lower.includes('league') || lower.includes('bcl') || lower.includes('chhatra league') || lower.includes('chatra league') || lower.includes('jl') ||
        lower.includes('আওয়ামী') || lower.includes('লীগ') || lower.includes('ছাত্রলীগ') || lower.includes('যুবলীগ')) return 'Awami League';

    if (lower.includes('jamaat') || lower.includes('shibir') || lower.includes('জামায়াত') || lower.includes('শিবির')) return 'Jamaat-Shibir';

    if (lower.includes('police') || lower.includes('rab') || lower.includes('ansar') || lower.includes('পুলিশ') || lower.includes('র‌্যাব')) return 'Police';

    if (lower.includes('jatiya') || lower.includes('jp') || lower.includes('ershad') || lower.includes('জাতীয় পার্টি')) return 'Jatiya Party';

    if (lower.includes('communist') || lower.includes('cpb') || lower.includes('bsad') || lower.includes('বাম') || lower.includes('left')) return 'Left Parties';

    if (lower.includes('hefazat') || lower.includes('hefazot') || lower.includes('হেফাজত')) return 'Hefazat-e-Islam';

    const found = PARTIES.find(p => lower.includes(p));
    if (found) return found.charAt(0).toUpperCase() + found.slice(1);

    return 'Unknown';
}

async function main() {
    console.log("🚀 Starting Comprehensive Party Role Re-Analysis...");
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

        let allParties = new Set([...existingParties.map(p => extractPartyName(p)), ...victims, ...perpetrators]);

        allParties.forEach(p => {
            initStats(p);
            stats[p].total++;
        });
        victims.forEach(p => {
            initStats(p);
            stats[p].victim++;
        });
        perpetrators.forEach(p => {
            initStats(p);
            stats[p].perpetrator++;
        });

        await prisma.politicalEvent.update({
            where: { id: event.id },
            data: {
                victimParties: JSON.stringify(victims),
                perpetratorParties: JSON.stringify(perpetrators)
            }
        });
        updatedCount++;
    }

    console.log(`\n✅ Analyzed and Updated ${updatedCount} events.`);
    console.log("\n📊 PARTY AFFILIATION STATS:");
    console.log("| Party | Incidents Involved | Victim Count | Perpetrator Count |");
    console.log("|---|---|---|---|");

    // FIXED SYNTAX HERE
    Object.entries(stats).sort((a, b) => b[1].total - a[1].total).forEach(([party, data]) => {
        if (party !== 'Unknown' && data.total > 0) {
            console.log(`| ${party} | ${data.total} | ${data.victim} | ${data.perpetrator} |`);
        }
    });
}

main()
    .catch(console.error)
    .finally(async () => { await prisma.$disconnect(); });
