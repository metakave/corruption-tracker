import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function mergeJashoreEvents() {
    console.log('🔧 Manually merging Jashore BNP leader events...\n')

    const keepId = '95d493ba-6c1d-42e2-a24a-dc5509688472' // Samakal (has name in title)
    const deleteId = '45c8e209-dbc7-44d6-b27a-57f1d06ebdf5' // Jugantor

    const keepEvent = await prisma.politicalEvent.findUnique({ where: { id: keepId } })
    const deleteEvent = await prisma.politicalEvent.findUnique({ where: { id: deleteId } })

    if (!keepEvent || !deleteEvent) {
        console.log('❌ One or both events not found!')
        return
    }

    console.log(`KEEP:   ${keepEvent.title}`)
    console.log(`        Source: ${keepEvent.source}`)
    console.log(`DELETE: ${deleteEvent.title}`)
    console.log(`        Source: ${deleteEvent.source}\n`)

    // Add Jugantor as additional source
    const currentSources = keepEvent.additionalSources ?
        JSON.parse(keepEvent.additionalSources) : []

    currentSources.push({
        url: deleteEvent.url,
        source: deleteEvent.source,
        title: deleteEvent.title
    })

    await prisma.politicalEvent.update({
        where: { id: keepId },
        data: { additionalSources: JSON.stringify(currentSources) }
    })

    console.log('✅ Added Jugantor as additional source')

    // Delete Jugantor event
    await prisma.politicalEvent.delete({ where: { id: deleteId } })

    console.log('✅ Deleted duplicate event\n')

    const finalCount = await prisma.politicalEvent.count()
    console.log(`Final Event Count: ${finalCount}`)
}

mergeJashoreEvents()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
