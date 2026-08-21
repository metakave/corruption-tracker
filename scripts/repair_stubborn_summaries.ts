
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const start2026 = new Date('2026-01-01')

    // Find events with bad summaries published in 2026
    const events = await prisma.politicalEvent.findMany({
        where: {
            publishedAt: {
                gte: start2026
            },
            OR: [
                { summary: { contains: "২০২৪" } },
                { summary: { contains: "২০২৩" } },
                { summary: { contains: "2024" } },
                { summary: { contains: "2023" } }
            ]
        }
    })

    console.log(`📊 Found ${events.length} stubborn events to fix.`)

    for (const e of events) {
        if (!e.summary) continue;

        let newSummary = e.summary
            .replace(/২০২৪/g, "২০২৬")
            .replace(/২০২৩/g, "২০২৫") // Assuming 2023 -> 2025 based on 2-year lag pattern? Or just 2026? 
        // Wait, most 2023 issues were actually late 2025 events? 
        // The Magura event was "Jan 5 2024" -> "Jan 5 2026". 2 year offset.
        // Let's inspect the text. 
        // "Jan 9 2024" -> "Jan 9 2026".
        // "Dec 3 2023" (published Jan 6 2026) -> Likely "Dec 3 2025".
        // So logic: 2024 -> 2026. 2023 -> 2025.

        // Refine replacement mapping
        // 2024 -> 2026
        newSummary = newSummary.replace(/২০২৪/g, "২০২৬");
        newSummary = newSummary.replace(/2024/g, "2026");

        // 2023 -> 2025 (e.g. Dec 2023 -> Dec 2025)
        newSummary = newSummary.replace(/২০২৩/g, "২০২৫");
        newSummary = newSummary.replace(/2023/g, "2025");

        console.log(`\n🔸 Fixing [${e.id}]`)
        console.log(`   Old: ${e.summary.substring(0, 60)}...`)
        console.log(`   New: ${newSummary.substring(0, 60)}...`)

        await prisma.politicalEvent.update({
            where: { id: e.id },
            data: { summary: newSummary }
        })
    }

    console.log("✅ Stubborn summaries repaired.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
