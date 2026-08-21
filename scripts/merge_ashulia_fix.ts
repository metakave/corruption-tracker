
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🛠️ Merging Ashulia Duplicate Events...")

    const keepId = 'db143eb7-9067-47f1-a34d-d51172131a58' // Jugantor
    const deleteId = '8fc0efe4-a9ab-4513-88ac-4690203de964' // DhakaPost

    // 1. Verify existence
    const keepEvent = await prisma.politicalEvent.findUnique({ where: { id: keepId } })
    const deleteEvent = await prisma.politicalEvent.findUnique({ where: { id: deleteId } })

    if (!keepEvent || !deleteEvent) {
        console.error("❌ One or both events not found!")
        return
    }

    // 2. Add 'Dhaka Post' to additionalSources of the kept event
    let newSources = keepEvent.additionalSources || ''
    if (!newSources.includes('Dhaka Post') && !newSources.includes(deleteEvent.source)) {
        newSources = newSources ? `${newSources}, Dhaka Post` : 'Dhaka Post'
    }

    console.log(`🔄 Updating kept event ${keepId}...`)
    await prisma.politicalEvent.update({
        where: { id: keepId },
        data: {
            additionalSources: newSources,
            // Ensure confidence is high if not already
            confidence: Math.max(keepEvent.confidence || 0, 0.95)
        }
    })

    // 3. Delete the duplicate
    console.log(`🗑️ Deleting duplicate event ${deleteId}...`)
    await prisma.politicalEvent.delete({
        where: { id: deleteId }
    })

    console.log("✅ Merge duplicate complete.")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
