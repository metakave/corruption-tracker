
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

// Helper to convert English Year to Bengali
function toBengaliNumerals(number: number): string {
    const map: { [key: string]: string } = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    }
    return number.toString().replace(/\d/g, (d) => map[d])
}

async function main() {
    console.log("🔍 Checking for Year Mismatches in Summaries (Text says 2026 but Date < 2026)...")

    // Find all events with "2026" or "২০২৬" in the summary
    const suspects = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { summary: { contains: '2026' } },
                { summary: { contains: '২০২৬' } }
            ]
        }
    })

    console.log(`Found ${suspects.length} events with '2026' in summary.`)

    for (const event of suspects) {
        if (!event.dateOfIncident) continue;

        const actualYear = event.dateOfIncident.getFullYear()

        // IF actual year is NOT 2026 (i.e. it was fixed to 2025 or 2024), we replace the text.
        if (actualYear < 2026) {
            console.log(`\nMismatch in Event: "${event.title.substring(0, 50)}..."`)
            console.log(`   ID: ${event.id}`)
            console.log(`   Actual Date: ${event.dateOfIncident.toISOString()} (Year: ${actualYear})`)
            console.log(`   Old Summary: ${event.summary?.substring(0, 100)}...`)

            let newSummary = event.summary || "";
            let changed = false;

            // Replace English 2026
            if (newSummary.includes('2026')) {
                newSummary = newSummary.replace(/2026/g, actualYear.toString());
                changed = true;
            }

            // Replace Bengali 2026 (২০২৬)
            if (newSummary.includes('২০২৬')) {
                const bnYear = toBengaliNumerals(actualYear);
                newSummary = newSummary.replace(/২০২৬/g, bnYear);
                changed = true;
            }

            if (changed) {
                console.log(`   -> New Summary: ${newSummary.substring(0, 100)}...`)

                await prisma.politicalEvent.update({
                    where: { id: event.id },
                    data: { summary: newSummary }
                })
                console.log(`   ✅ Fixed Summary.`)
            }
        } else {
            // It IS 2026? Then maybe it's actually in the future and we missed fixing the date?
            // Or it's Jan 2026 and correct?
            // But we ran the date fix script, so any invalid future dates should be gone.
            // If date is > Now, it might be weird.
            const now = new Date();
            if (event.dateOfIncident > now) {
                console.log(`   ⚠️ Skipped: Date is still in Future (${event.dateOfIncident.toISOString()}). User logic implies date IS fixed though?`)
                // If the user says "Wrong dates", and we see 2026 in text, we implicitly trust the text mismatch script IF the date was backdated.
                // If date wasn't backdated, we skip.
            }
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
