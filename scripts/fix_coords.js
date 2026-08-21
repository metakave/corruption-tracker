
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // Mymensingh City Center Coordinates: 24.7471° N, 90.4203° E
    const updated = await prisma.politicalEvent.update({
        where: {
            id: "39c18b73-877e-4932-9700-5b312a09e9e9"
        },
        data: {
            latitude: 24.7471,
            longitude: 90.4203
        }
    })

    console.log("Updated event coordinates:", updated.title, updated.latitude, updated.longitude)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
