
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Searching for Rumin Farhana event to correct DATE to Feb 6...")

    // Find by title or text
    const suspects = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'রুমিন ফারহানা' } },
                { summary: { contains: 'রুমিন ফারহানা' } }
            ]
        }
    })

    console.log(`Found ${suspects.length} events.`)

    for (const event of suspects) {
        // We want the specific event about the "Stage Vandalism" (মঞ্চ ভাঙচুর)
        // Or just the one we recently touched (date is Feb 9, 2025 or 2026)

        const isTarget = (event.title.includes('মঞ্চ') || event.summary?.includes('মঞ্চ'))
            || (event.dateOfIncident?.getMonth() === 1); // Feb

        if (isTarget) {
            console.log(`\nTARGET: "${event.title}"`)
            console.log(`   Current Date: ${event.dateOfIncident?.toISOString()}`)

            // New Date: Feb 6, 2025
            // User said: "not 2025 its 2025 but 6 feb" -> Implies 2025 is year, 6 Feb is day.
            const newDate = new Date('2025-02-06T12:00:00.000Z'); // Noon UTC+6 approx

            // Fix Text: "9" -> "6", "৯" -> "৬"
            let newSummary = event.summary || "";

            // Heuristic replacing
            newSummary = newSummary.replace(/৯ ফেব্রুয়ারি/g, '৬ ফেব্রুয়ারি');
            newSummary = newSummary.replace(/9 February/g, '6 February');
            newSummary = newSummary.replace(/০৯ ফেব্রুয়ারি/g, '০৬ ফেব্রুয়ারি');

            // Ensure Year is 2025 in text
            newSummary = newSummary.replace(/2026/g, '2025');
            newSummary = newSummary.replace(/২০২৬/g, '২০২৫');

            console.log(`   -> Setting Date: ${newDate.toISOString()}`)
            console.log(`   -> New Summary Snippet: ${newSummary.substring(0, 50)}...`)

            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: {
                    dateOfIncident: newDate,
                    publishedAt: newDate,
                    summary: newSummary
                }
            })
            console.log("   ✅ Fixed Date and Text.")
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
