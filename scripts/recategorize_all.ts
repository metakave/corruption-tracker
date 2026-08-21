
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Categorization Logic
function determineCategory(title: string, summary: string, parties: string[]): string {
    const text = (title + ' ' + summary).toLowerCase();

    // 0. Explicit Exclusions (Land/Family Disputes -> Other/Criminal)
    const isLandDispute =
        text.includes('land dispute') ||
        text.includes('property dispute') ||
        text.includes('boundary dispute') ||
        text.includes('জমি নিয়ে') ||
        text.includes('জমিজমা') ||
        text.includes('জমিসংক্রান্ত') ||
        text.includes('পারিবারিক কলহ') || // Family feud
        text.includes('পূর্ব বিরোধ') // Prior enmity
        ;

    // 1. Mob Justice (Highly Specific)
    if (
        text.includes('mob') ||
        text.includes('lynch') ||
        text.includes('mass beating') ||
        text.includes('ganopituni') ||
        text.includes('mass thrashing') ||
        text.includes('গণপিটুনি') ||
        text.includes('পিটুনি') ||
        text.includes('জনতা')
    ) {
        return 'mob_justice';
    }

    // 2. Terrorism / Extremist (Highly Specific)
    if (
        text.includes('bomb') ||
        text.includes('ied') ||
        text.includes('suicide attack') ||
        text.includes('extremist') ||
        text.includes('militant') ||
        text.includes('blast') ||
        text.includes('cocktail') ||
        text.includes('বোমা') ||
        text.includes('ককটেল') ||
        text.includes('জঙ্গি') ||
        text.includes('চরমপন্থী') ||
        text.includes('kuki-chin') ||
        text.includes('knf') ||
        text.includes('jmb')
    ) {
        return 'terrorism';
    }

    // 3. Communal / Religious (Highly Specific)
    if (
        text.includes('temple') ||
        text.includes('mosque') ||
        text.includes('church') ||
        text.includes('hindu') ||
        text.includes('muslim') ||
        text.includes('christian') ||
        text.includes('buddhist') ||
        text.includes('idol') ||
        text.includes('puja') ||
        text.includes('minority') ||
        text.includes('religious') ||
        text.includes('প্রতিমা') ||
        text.includes('মন্দির') ||
        text.includes('গির্জা') ||
        text.includes('মসজিদ') ||
        text.includes('সংখ্যালঘু') ||
        text.includes('সাম্প্রদায়িক')
    ) {
        return 'communal';
    }

    // 4. Gender Based (Highly Specific)
    if (
        text.includes('rape') ||
        text.includes('gang-rape') ||
        text.includes('abuse') ||
        text.includes('dowry') ||
        text.includes('acid') ||
        text.includes('domestic violence') ||
        text.includes('sexual') ||
        text.includes('woman') ||
        text.includes('girl') ||
        text.includes('housewife') ||
        text.includes('ধর্ষণ') ||
        text.includes('যৌতুক') ||
        text.includes('নির্যাতন') ||
        text.includes('গৃবধু') ||
        text.includes('গৃহবধূ') ||
        text.includes('নারী')
    ) {
        return 'gender';
    }

    // 5. Criminal Violence (High Priority Regular Crime)
    if (
        text.includes('robbery') ||
        text.includes('dacoity') ||
        text.includes('thief') ||
        text.includes('theft') ||
        text.includes('mugging') ||
        text.includes('snatching') ||
        text.includes('drug') ||
        text.includes('yaba') ||
        text.includes('fencidyl') ||
        text.includes('extortion') ||
        text.includes('toll') ||
        text.includes('smuggling') ||
        text.includes('bribe') ||
        text.includes('gambling') ||
        text.includes('human trafficking') ||
        text.includes('chanda') || // Extortion
        text.includes('hijack') ||
        text.includes('piracy') ||
        text.includes('fraud') ||
        text.includes('kidnap') ||
        text.includes('abduction') ||
        text.includes('ransom') ||
        text.includes('ডাকাতি') ||
        text.includes('ছিনতাই') ||
        text.includes('চুরি') ||
        text.includes('মাদক') ||
        text.includes('ইয়াবা') ||
        text.includes('চাঁদা') ||
        text.includes('চাঁদাবাজি') ||
        text.includes('পাচার') ||
        text.includes('অপহরণ') ||
        text.includes('মুক্তিপণ')
    ) {
        return 'criminal';
    }

    // 6. Political Violence - STRICT MODE
    // A. Dictionary of Major Political Terms
    const politicalKeywords = [
        'bnp', 'awami', 'league', 'jamaat', 'jatiya party', 'jp', 'cpb', 'jss', 'updf',
        'shibir', 'chatra', 'jubo', 'sramik', 'swechasebak', 'matsyajibi', 'krishak',
        'বিএনপি', 'আওয়ামী', 'লীগ', 'জামায়াত', 'জাতীয় পার্টি', 'জাপা', 'জেএসএস', 'ইউপিডিএফ',
        'শিবির', 'ছাত্র', 'যুব', 'শ্রমিক', 'স্বেচ্ছাসেবক'
    ];

    const contextKeywords = [
        'election', 'vote', 'campaign', 'polling', 'ballot', 'candidate',
        'নির্বাচন', 'ভোট', 'প্রচারণা', 'প্রার্থী',
        'party clash', 'factional clash', 'politics', 'political',
        'রাজনীতি', 'রাজনৈতিক'
    ];

    const hasMajorParty = politicalKeywords.some(k => text.includes(k));
    const hasContext = contextKeywords.some(k => text.includes(k));

    if (!isLandDispute && (hasMajorParty || hasContext)) {
        return 'political';
    }

    // 7. Generic Violence -> Criminal or Other
    if (
        text.includes('murder') ||
        text.includes('killing') ||
        text.includes('stabbed') ||
        text.includes('shot') ||
        text.includes('gunfight') ||
        text.includes('body recovered') ||
        text.includes('corpse') ||
        text.includes('homicide') ||
        text.includes('slaughter') ||
        text.includes('হত্যা') ||
        text.includes('খুন') ||
        text.includes('লাশ') ||
        text.includes('মরদেহ') ||
        text.includes('জখম') ||
        text.includes('কুপিয়ে') ||
        text.includes('গুলি') ||
        text.includes('বন্দুকযুদ্ধ')
    ) {
        if (isLandDispute) return 'other';
        return 'criminal';
    }

    // 8. Other
    return 'other';
}

async function main() {
    console.log("🚀 Starting STRICT Recategorization...");

    const events = await prisma.politicalEvent.findMany();
    console.log(`Found ${events.length} events.`);

    let stats = {
        political: 0,
        mob_justice: 0,
        communal: 0,
        gender: 0,
        criminal: 0,
        terrorism: 0,
        other: 0
    };

    for (const event of events) {
        let parties: string[] = [];
        try {
            if (event.politicalParties) {
                parties = typeof event.politicalParties === 'string'
                    ? JSON.parse(event.politicalParties)
                    : event.politicalParties;
            }
        } catch {
            parties = [];
        }

        const newCategory = determineCategory(
            event.title || '',
            event.summary || '',
            (Array.isArray(parties) ? parties : [])
        );

        const categoryJson = JSON.stringify([newCategory]);

        await prisma.politicalEvent.update({
            where: { id: event.id },
            data: {
                category: categoryJson,
            }
        });

        // @ts-ignore
        if (stats[newCategory] !== undefined) stats[newCategory]++;
        // @ts-ignore
        else stats.other++;

        process.stdout.write('.');
    }

    console.log("\n\n✅ Recategorization Complete!");
    console.log("Stats:", stats);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
