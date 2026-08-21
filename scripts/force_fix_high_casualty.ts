
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- FINDING HIGH CASUALTY EVENTS ---')

    const events = await prisma.politicalEvent.findMany({
        where: { killed: { gt: 5 } }
    })

    console.log(`Found ${events.length} events with > 5 killed`)

    for (const e of events) {
        console.log(`[${e.id}] ${e.title} -> Killed: ${e.killed}`)

        // Target specific event by title keyword "Jubo Dal" and "shot"
        if (e.title.includes('যুবদল নেতাকে') && e.title.includes('গুলি')) {
            console.log('   >>> IDENTIFIED TARGET EVENT. FIXING...')

            await prisma.politicalEvent.update({
                where: { id: e.id },
                data: {
                    killed: 1,
                    injured: 0, // Assuming 0 if verified, or leave as is? Let's check summary.
                    // Summary: "...sohel rana... shot dead... wife injured..."
                    // So killed=1, injured=1 (wife)
                }
            })
            console.log('   ✅ Fixed to Killed: 1, Injured: 0 (Modify to 1 if wife injured)')

            // Check summary for injury context
            if (e.summary && e.summary.includes('আহত')) {
                await prisma.politicalEvent.update({
                    where: { id: e.id },
                    data: { injured: 1 }
                })
                console.log('   ✅ Adjusted Injured to 1 based on summary keywords')
            }
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
