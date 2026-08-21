
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- MAP ISSUE INSPECTION ---')

    // 1. Check for Misplaced Kurigram Events
    console.log('\n🔍 SEARCHING FOR MISPLACED KURIGRAM EVENTS...')
    const kurigramEvents = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'কুড়িগ্রাম' } },
                { title: { contains: 'Kurigram' } },
                { summary: { contains: 'কুড়িগ্রাম' } }
            ]
        },
        select: { id: true, title: true, district: true, latitude: true, longitude: true }
    })

    kurigramEvents.forEach(e => {
        const isDhaka = e.district === 'ঢাকা' || (e.latitude && Math.abs(e.latitude - 23.81) < 0.1)
        if (isDhaka) {
            console.log(`⚠️ MISPLACED: [${e.district}] ${e.title} (${e.latitude}, ${e.longitude})`)
            console.log(`   ID: ${e.id}`)
        } else {
            console.log(`✅ OK: [${e.district}] ${e.title}`)
        }
    })

    // 2. Check for "Mobile" Clashes in Dhaka
    console.log('\n🔍 SEARCHING FOR MOBILE BUSINESS CLASH DUPLICATES...')
    const mobileEvents = await prisma.politicalEvent.findMany({
        where: {
            OR: [
                { title: { contains: 'মোবাইল' } },
                { title: { contains: 'মুঠোফোন' } },
                { title: { contains: 'Mobile' } }
            ]
        },
        orderBy: { title: 'asc' }
    })

    mobileEvents.forEach(e => {
        console.log(`[${e.district}] ${e.title} -- ${e.id}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
