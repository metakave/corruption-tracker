
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const id = "7c6b15c4-f77a-40fd-bec8-c7ee638a25d3"
    const event = await prisma.politicalEvent.findUnique({ where: { id } })
    console.log(event)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
