
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const events = await prisma.politicalEvent.findMany({
        where: {
            title: {
                contains: "মাগুরায় গৃহবধূকে দলবদ্ধ ধর্ষণের অভিযোগ"
            }
        },
        select: {
            id: true,
            title: true,
            dateOfIncident: true,
            publishedAt: true,
            rawText: true,
            summary: true
        }
    })

    console.log(JSON.stringify(events, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
