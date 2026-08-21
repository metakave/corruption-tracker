
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const EVENT_ID = 'b9f52cf5-d03a-4d26-988b-06ab94dc08cc'
    console.log(`Fixing event ${EVENT_ID}...`)

    const event = await prisma.politicalEvent.findUnique({
        where: { id: EVENT_ID }
    })

    if (!event) {
        console.error('Event not found!')
        return
    }

    console.log(`Current Killed: ${event.killed}`)

    const updated = await prisma.politicalEvent.update({
        where: { id: EVENT_ID },
        data: {
            killed: 1, // Fix from 3 to 1
            severityScore: 8 // Manually set severity if needed, but 8 is fine for a killing
        }
    })

    console.log(`Updated Killed: ${updated.killed}`)
    console.log('Fix applied successfully.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
