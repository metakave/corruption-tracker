
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const targetId = "409d2f1b-918f-4358-a734-f8a4626fb960"
    console.log(`\n🔍 Finding Rank for Event: ${targetId}`)

    // Fetch all IDs sorted by date (same logic as API)
    // We only need ID to find index
    // Optimization: filtering by date roughly to avoid fetching 10k rows?
    // But we need exact rank. Let's fetch top 1000.

    const events = await prisma.politicalEvent.findMany({
        orderBy: [
            { dateOfIncident: 'desc' },
            { publishedAt: 'desc' }
        ],
        select: { id: true },
        take: 100
    })

    const index = events.findIndex(e => e.id === targetId)

    if (index === -1) {
        console.log("❌ Event not found in top 100! It is very old or missing.")
    } else {
        const rank = index + 1
        console.log(`✅ Event found at Rank: #${rank}`)

        if (rank > 15) {
            console.log("⚠️ EXPLANATION: Homepage Top 15 Feed limit reached. It is filtered out.")
        } else {
            console.log("❓ EXPLANATION: It is within Top 15. Should be visible.")
        }

        if (rank > 50) {
            console.log("⚠️ EXPLANATION: /feed Page limit (50) reached. It is filtered out there too.")
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
