
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🚀 Starting Comprehensive Date Audit...")

    // Logic: 
    // Published in 2025 or 2026
    // BUT Incident Date is BEFORE 2025 (i.e., 2024, 2023, etc.)

    const start2025 = new Date('2025-01-01')

    const events = await prisma.politicalEvent.findMany({
        where: {
            publishedAt: {
                gte: start2025
            },
            dateOfIncident: {
                lt: start2025
            }
        },
        select: {
            id: true,
            title: true,
            publishedAt: true,
            dateOfIncident: true,
            url: true
        }
    })

    console.log(`📊 Found ${events.length} potential date mismatches (Published 2025+ / Incident < 2025).`)

    // Group by year of incident for summary
    const distribution: Record<string, number> = {}

    events.forEach(e => {
        const year = e.dateOfIncident ? new Date(e.dateOfIncident).getFullYear().toString() : 'NULL'
        distribution[year] = (distribution[year] || 0) + 1

        // Show first 5 examples
        if (distribution[year] <= 3) {
            console.log(`   [${year}] ID: ${e.id} | Pub: ${e.publishedAt.toISOString().split('T')[0]} | Inc: ${e.dateOfIncident?.toISOString().split('T')[0]} | ${e.title.substring(0, 40)}...`)
        }
    })

    console.log("\n📉 Unlikely Incident Year Distribution:", distribution)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
