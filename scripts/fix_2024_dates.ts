
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🚀 Starting Date Fix Audit...")

    // Find events with incident date in 2024 but published in 2026
    const start2024 = new Date('2024-01-01')
    const end2024 = new Date('2024-12-31')
    const start2026 = new Date('2026-01-01')

    const events = await prisma.politicalEvent.findMany({
        where: {
            dateOfIncident: {
                gte: start2024,
                lte: end2024
            },
            publishedAt: {
                gte: start2026
            }
        }
    })

    console.log(`📊 Found ${events.length} suspicious events (2024 Incident / 2026 Published).`)

    for (const event of events) {
        const newDate = event.publishedAt
        console.log(`   🔸 ID: ${event.id}`)
        console.log(`      Title: ${event.title}`)
        console.log(`      Current Incident Date: ${event.dateOfIncident?.toISOString().split('T')[0]}`)
        console.log(`      Published At:          ${event.publishedAt.toISOString().split('T')[0]}`)
        console.log(`      ACTION: Will update incident date to ${newDate.toISOString().split('T')[0]}`)

        // Uncomment to execute
        await prisma.politicalEvent.update({
            where: { id: event.id },
            data: { dateOfIncident: newDate }
        })
    }

    console.log("✅ Fix Complete.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
