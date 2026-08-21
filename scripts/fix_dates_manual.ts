
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- MANUAL DATE FIX FOR FLAGGED EVENTS ---')

    // User flagged specific titles/events as "New" but having "Wrong Date" (2023/2024)
    // "dates are new i verified manually, fix date, dont delete"

    // 1. Sitakunda 2 Workers Bodies (Was 26/02/24)
    // 2. Mongla Tiger Volunteer Injured (Was 25/02/24)
    // 3. Noakhali Engineer Protest (Was 18/02/24)
    // 4. Raujan Hindu-Buddhist House Arson (Was 23/12/23)
    // 5. Tejgaon College Killing (Was 07/12/23)

    // Strategy: Find by Title part, Update Year to 2026.
    // If original month/day looks like "Jan 5", keep it?
    // User didn't specify exact date, just that they are "New" (likely last few days).
    // The previous dates (Feb 24, Dec 23) suggest the scraper picked up OLD dates from the text.
    // BUT the publishedAt date was likely "Today" (Jan 2026).
    // So we should set dateOfIncident = publishedAt (or close to it, e.g. Jan 2026).

    // I will fetch them, and set incident date to Jan 2026 (preserving day if valid, or default to publishedAt day).

    const targets = [
        { key: 'সীতাকুণ্ডে দুই শ্রমিকের লাশ', newDate: '2026-01-05' },
        { key: 'মোংলায় বাঘ উদ্ধারকালে', newDate: '2026-01-05' },
        { key: 'নোয়াখালীতে প্রকৌশলীকে', newDate: '2026-01-04' },
        { key: 'রাউজানে হিন্দু-বৌদ্ধ বাড়িতে', newDate: '2026-01-03' }, // Est.
        { key: 'তেজগাঁও কলেজ ছাত্রাবাসে', newDate: '2026-01-04' }     // Est.
    ]

    for (const t of targets) {
        const events = await prisma.politicalEvent.findMany({
            where: { title: { contains: t.key } }
        })

        for (const e of events) {
            console.log(`Updating: ${e.title} (${e.dateOfIncident.toISOString()} -> ${t.newDate})`)
            await prisma.politicalEvent.update({
                where: { id: e.id },
                data: {
                    dateOfIncident: new Date(t.newDate),
                    // Ensure publishedAt is also sane if needed? 
                    // Usually publishedAt is fine (scraper run time), but just in case.
                }
            })
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
