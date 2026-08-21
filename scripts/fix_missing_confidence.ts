
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🛡️ Checking for events with missing or zero confidence scores...")

    // 1. Find problematic events
    const zeroConfidenceEvents = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { confidence: null },
                { confidence: 0 },
                { confidence: { lt: 0.1 } } // Catch very low scores too
            ]
        },
        select: { id: true, title: true, confidence: true }
    })

    console.log(`Found ${zeroConfidenceEvents.length} events with 0% or missing confidence.`)

    if (zeroConfidenceEvents.length === 0) {
        console.log("✅ No issues found. All events have confidence scores.")
        return
    }

    console.log("🔄 Patching events with default confidence (0.85 / 85%)...")

    let updated = 0
    for (const event of zeroConfidenceEvents) {
        try {
            await prisma.politicalEvent.update({
                where: { id: event.id },
                data: { confidence: 0.85 }
            })
            updated++
            if (updated % 50 === 0) process.stdout.write('.')
        } catch (e) {
            console.error(`\nFailed to update ${event.id}:`, e)
        }
    }

    console.log(`\n✅ Successfully backfilled ${updated} events.`)
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
