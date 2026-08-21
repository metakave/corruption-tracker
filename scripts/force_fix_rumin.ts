
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Searching for specific text: '২০২৬ সালের ৯ ফেব্রুয়ারি'...")

    // Broad search across fields
    const suspects = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { summary: { contains: '২০২৬ সালের ৯ ফেব্রুয়ারি' } },
                { rawText: { contains: '২০২৬ সালের ৯ ফেব্রুয়ারি' } }, // Sometimes summary is just raw text
                { title: { contains: 'রুমিন ফারহানা' } } // Fallback to Title + check date
            ]
        }
    })

    console.log(`Found ${suspects.length} potential matches.`)

    for (const event of suspects) {
        // Filter: Must actually contain the bad year text OR be in the future
        const summaryHasBadText = event.summary?.includes('২০২৬') || event.summary?.includes('2026');
        const isFuture = event.dateOfIncident && event.dateOfIncident.getFullYear() >= 2026;

        if (summaryHasBadText || isFuture) {
            console.log(`\n🎯 TARGET ACQUIRED: "${event.title.substring(0, 50)}..."`)
            console.log(`   ID: ${event.id}`)
            console.log(`   Date: ${event.dateOfIncident?.toISOString()} (Year: ${event.dateOfIncident?.getFullYear()})`)
            console.log(`   Summary: ${event.summary?.substring(0, 50)}...`)

            // FORCE FIX
            // 1. Fix Date -> 2025 (Assuming it thinks it's 2026)
            // But wait, user said "Feb 9". 
            // If Text says "Feb 9", and today is Jan 6. Feb 9 is FUTURE.
            // If it's a real event, it must be Feb 9, 2025.

            const newDate = new Date(event.dateOfIncident || new Date());
            if (newDate.getFullYear() >= 2026) {
                newDate.setFullYear(2025); // Force to last year
            }

            // 2. Fix Text
            // Replace "২০২৬" with "২০২৫"
            // Replace "2026" with "2025"
            let newSummary = event.summary || "";
            newSummary = newSummary.replace(/২০২৬/g, '২০২৫');
            newSummary = newSummary.replace(/2026/g, '2025');

            console.log(`   -> New Date: ${newDate.toISOString()}`)
            console.log(`   -> New Summary Start: ${newSummary.substring(0, 50)}...`)

            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    dateOfIncident: newDate,
                    publishedAt: newDate,
                    summary: newSummary
                }
            })
            console.log("   ✅ Target Neutralized (Fixed).")
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
