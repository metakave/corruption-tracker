
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const eventId = "409d2f1b-918f-4358-a734-f8a4626fb960"
    const event = await prisma.politicalEvent.findUnique({
        where: { id: eventId },
        select: { id: true, killed: true, injured: true, severityScore: true }
    })
    console.log(JSON.stringify(event, null, 2))
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
