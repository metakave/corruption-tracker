
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🧹 Starting Database Source Cleanup...")

    const events = await prisma.politicalEvent.findMany()
    let fixedCount = 0

    for (const event of events) {
        if (!event.additionalSources) continue

        try {
            const sources = JSON.parse(event.additionalSources)
            if (sources.length > 5) {
                console.log(`[FIX] Event "${event.title.substring(0, 30)}..." has ${sources.length} sources. Keeping top 4.`)

                // Keep only top 4
                const newSources = sources.slice(0, 4)

                await prisma.politicalEvent.update({
                    where: { id: event.id },
                    data: {
                        additionalSources: JSON.stringify(newSources)
                    }
                })
                fixedCount++
            }
        } catch (e) {
            console.error(`Error processing event ${event.id}:`, e)
        }
    }

    console.log(`✅ Cleanup Complete. Truncated sources for ${fixedCount} events.`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
