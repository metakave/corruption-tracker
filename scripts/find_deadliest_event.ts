
import { prisma } from '../lib/db'

async function main() {
    console.log('Searching for event...')

    // Search for the event shown in the screenshot
    // "শরীয়তপুরের ডামুড্যায় ব্যবসায়ীকে কুপি" OR English equivalent

    const events = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'Shariatpur', mode: 'insensitive' } },
                { title: { contains: 'শরীয়তপুর' } },
                { district: { contains: 'Shariatpur', mode: 'insensitive' } }
            ]
        },
        take: 5,
        orderBy: { publishedAt: 'desc' },
        select: {
            id: true,
            title: true,
            killed: true,
            injured: true,
            url: true,
            summary: true,
            publishedAt: true
        }
    })

    console.log(`Found ${events.length} events matching 'Shariatpur'.`)

    events.forEach(e => {
        console.log(`\nID: ${e.id}`)
        console.log(`Title: ${e.title}`)
        console.log(`Killed: ${e.killed}, Injured: ${e.injured}`)
        console.log(`URL: ${e.url}`)
        console.log(`Summary: ${e.summary}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
