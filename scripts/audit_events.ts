
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- FULL DATA AUDIT ---')

    // Fetch all events
    const events = await prisma.politicalEvent.findMany({
        orderBy: { publishedAt: 'desc' }
    })

    console.log(`Analyzing ${events.length} events...`)

    const suspiciousUrls = []
    const suspiciousLocs = []
    const suspiciousDates = []

    for (const e of events) {
        // 1. URL Check (Basic phrasing check)
        // If Title contains "Sitakunda" but URL contains "techlife" -> Suspicious
        // We can check if URL contains *any* significant keywords from title?
        // Hard to do nicely with Bengali title vs English URL.
        // Let's just log them all for manual visual inspection by the Agent?
        // Or flag specific patterns like "techlife", "entertainment", "sports" if the category is violence.

        if (e.url.includes('techlife') || e.url.includes('lifestyle') || e.url.includes('entertainment')) {
            suspiciousUrls.push({ id: e.id, title: e.title, url: e.url, reason: 'Category Mismatch' })
        }

        // 2. Coordinate Check
        // If District is defined but Coords are missing or default
        if (e.district && (!e.latitude || !e.longitude)) {
            suspiciousLocs.push({ id: e.id, title: e.title, district: e.district, reason: 'Missing Coords' })
        }
        // If District is NOT Dhaka but Coords are Dhaka (23.81, 90.41)
        if (e.district !== 'ঢাকা' && e.latitude && Math.abs(e.latitude - 23.81) < 0.05 && Math.abs(e.longitude - 90.41) < 0.05) {
            suspiciousLocs.push({ id: e.id, title: e.title, district: e.district, reason: 'Dhaka Coords for Non-Dhaka' })
        }

        // 3. Date Check
        // If dateOfIncident is older than 2025? (Since this user seems focused on recent/current stuff, but maybe 2024 is valid context? User said "2026 Jan 5").
        // "2024" might be old processing.
        const d = new Date(e.dateOfIncident || e.publishedAt)
        if (d.getFullYear() < 2025) {
            suspiciousDates.push({ id: e.id, title: e.title, date: d.toISOString(), reason: 'Old Date (Pre-2025)' })
        }
    }

    // OUTPUT FOR AGENT REVIEW
    console.log('\n🚩 SUSPICIOUS URLS:')
    suspiciousUrls.forEach(i => console.log(`   [${i.id}] ${i.title}\n      -> ${i.url}`))

    if (suspiciousUrls.length === 0) console.log('   (None detected by keyword, manual review needed)')

    console.log('\n🚩 SUSPICIOUS LOCATIONS:')
    suspiciousLocs.forEach(i => console.log(`   [${i.id}] [${i.district}] ${i.title} -> ${i.reason}`))

    console.log('\n🚩 SUSPICIOUS DATES:')
    suspiciousDates.forEach(i => console.log(`   [${i.id}] ${i.title} -> ${i.date}`))

    console.log('\n--- FULL LIST FOR MANUAL REVIEW (JSON) ---')
    // We print simplified JSON for the agent to read into context
    console.log(JSON.stringify(events.map(e => ({
        id: e.id,
        title: e.title,
        district: e.district,
        url: e.url,
        date: (e.dateOfIncident || e.publishedAt).toISOString().split('T')[0],
        killed: e.killed
    })), null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
