
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const ids = ['f95fbe5e-d25a-4e58-971c-40ad62250165', '695e3207-6b4d-4e9e-99f6-1e9052d3a3d5']

    const events = await prisma.politicalEvent.findMany({
        where: { id: { in: ids } }
    })

    for (const e of events) {
        console.log(`\nEvent: ${e.title} (${e.id})`)
        console.log(`Current Killed: ${e.killed}`)
        console.log(`Sources:`)
        if (e.additionalSources) {
            const extra = JSON.parse(e.additionalSources)
            console.log(JSON.stringify(extra.casualtyEstimates, null, 2))
            console.log('--- Original Sources ---')
            console.log(JSON.stringify(extra.sources, null, 2))
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
