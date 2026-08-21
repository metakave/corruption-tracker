
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOURCE_SEARCH_URLS: Record<string, string> = {
    "Prothom Alo": "https://www.prothomalo.com/search?q=",
    "Jugantor": "https://www.jugantor.com/search-result?q=",
    "Samakal": "https://samakal.com/search?q=",
    "Dhaka Post": "https://www.dhakapost.com/search?q=",
    "Ajker Patrika": "https://www.ajkerpatrika.com/search?q=",
    "News24BD": "https://www.news24bd.tv/search?q=",
};

// Default fallback
const GOOGLE_SEARCH = "https://www.google.com/search?q=";

async function main() {
    console.log("🔗 Fixing Missing URLs...");

    const events = await prisma.politicalEvent.findMany({
        where: {
            url: { contains: 'moving-url' } // Check for what I actually used... wait, check import script
        },
        select: { id: true, title: true, source: true, url: true }
    });

    // The import script used: url || `https://example.com/missing-url-${id}`
    // So looking for "missing-url"
    const eventsToFix = await prisma.politicalEvent.findMany({
        where: {
            url: { contains: 'missing-url' }
        },
        select: { id: true, title: true, source: true, url: true }
    });

    console.log(`Found ${eventsToFix.length} events with missing URLs.`);

    for (const event of eventsToFix) {
        const source = event.source || "";
        const title = event.title;
        let searchBase = GOOGLE_SEARCH;

        // Find matching source base
        const matchedSource = Object.keys(SOURCE_SEARCH_URLS).find(k =>
            source.toLowerCase().includes(k.toLowerCase())
        );

        if (matchedSource) {
            searchBase = SOURCE_SEARCH_URLS[matchedSource];
        }

        const newUrl = `${searchBase}${encodeURIComponent(title)}`;
        console.log(`\nEvent: ${title}`);
        console.log(`   Old URL: ${event.url}`);
        console.log(`   Source: ${source} -> ${matchedSource || 'Google'}`);
        console.log(`   New URL: ${newUrl}`);

        await prisma.politicalEvent.update({
            where: { id: event.id },
            data: { url: newUrl }
        });
    }

    console.log("\n✅ URL Fix Complete.");
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
