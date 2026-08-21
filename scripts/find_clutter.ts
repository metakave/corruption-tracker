
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const events = await prisma.politicalEvent.findMany()

    console.log("Checking for cluttered events...")
    for (const e of events) {
        if (e.additionalSources) {
            try {
                const s = JSON.parse(e.additionalSources)
                if (s.length > 3) {
                    console.log(`[${s.length} Sources] [${e.id}] ${e.title}`)
                    console.log(JSON.stringify(s, null, 2))
                    console.log('---')
                }
            } catch (err) { }
        }
    }
}

main()
    .finally(() => prisma.$disconnect())
