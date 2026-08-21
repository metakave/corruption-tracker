
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- REPAIRING CASUALTY COUNTS ---')

    // Fetch all events with high casualties or mergedFrom flag
    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { killed: { gt: 1 } },
                { additionalSources: { contains: 'casualtyEstimates' } }
            ]
        }
    })

    console.log(`Found ${events.length} candidates for repair`)
    let fixed = 0

    for (const event of events) {
        if (!event.additionalSources) continue

        try {
            const extra = JSON.parse(event.additionalSources)
            if (extra.casualtyEstimates && Array.isArray(extra.casualtyEstimates)) {

                const estimates = extra.casualtyEstimates as { killed: number, injured: number }[]
                if (estimates.length === 0) continue

                // Calculate Max
                const maxKilled = Math.max(...estimates.map(e => e.killed || 0))
                const maxInjured = Math.max(...estimates.map(e => e.injured || 0))

                // Check if current differs significantly
                if (event.killed > maxKilled * 1.5 || event.injured > maxInjured * 1.5) {
                    console.log(`   Fixing Event ${event.id.substring(0, 8)} (${event.title.substring(0, 20)}...):`)
                    console.log(`      Killed: ${event.killed} -> ${maxKilled}`)
                    console.log(`      Injured: ${event.injured} -> ${maxInjured}`)

                    await prisma.politicalEvent.update({
                        where: { id: event.id },
                        data: {
                            killed: maxKilled,
                            injured: maxInjured
                        }
                    })
                    fixed++
                }
            }
        } catch (e) {
            console.warn(`Failed to parse/fix event ${event.id}`)
        }
    }

    console.log(`\n✅ Repaired ${fixed} events`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
