
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔄 Starting Database Cleanup...")

    // 1. Fetch all events
    const events = await prisma.politicalEvent.findMany()
    console.log(`Found ${events.length} events. Checking for duplicate sources...`)

    let updatedCount = 0

    for (const event of events) {
        if (!event.additionalSources) continue

        try {
            const sources = JSON.parse(event.additionalSources)
            if (!Array.isArray(sources)) continue

            if (sources.length > 2) {
                console.log(`[Inspection] Event: ${event.title}`)
                console.log(`Sources (${sources.length}):`, JSON.stringify(sources, null, 2))
            }

            // Deduplicate by URL
            const uniqueSources = sources.filter((s: any, index: number, self: any[]) =>
                index === self.findIndex((t: any) => (
                    t.url === s.url
                ))
            )

            if (uniqueSources.length !== sources.length) {
                console.log(`   🛠 Fixing Event "${event.title.substring(0, 30)}...": ${sources.length} -> ${uniqueSources.length} sources`)

                await prisma.politicalEvent.update({
                    where: { id: event.id },
                    data: {
                        additionalSources: JSON.stringify(uniqueSources)
                    }
                })
                updatedCount++
            }
        } catch (e) {
            console.error(`Error parsing sources for event ${event.id}:`, e)
        }
    }

    console.log(`✅ Cleanup Complete. Fixed ${updatedCount} events with duplicate sources.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
