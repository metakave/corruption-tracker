
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const events = await prisma.politicalEvent.findMany({
        where: {
            title: {
                contains: 'গফরগাঁও'
            }
        },
        select: {
            id: true,
            title: true,
            district: true,
            latitude: true,
            longitude: true
        }
    })

    console.log(JSON.stringify(events, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
