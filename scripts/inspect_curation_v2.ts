
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 INSPECTING CURATION STATUS (V2)")

    // 1. Naim Event
    console.log("\n1. Checking Naim Event (25c8...)...")
    const naim = await prisma.politicalEvent.findUnique({
        where: { id: '25c8dfd4-1bfc-4c3f-bfc6-f0c68a745e45' }
    })
    if (naim) {
        console.log(`Title: ${naim.title}`)
        const sources = naim.additionalSources ? JSON.parse(naim.additionalSources) : []
        console.log(`Sources Count: ${sources.length}`)
        sources.forEach((s: any) => console.log(` - ${s.url}`))
    } else {
        console.log("❌ Naim event NOT FOUND by ID.")
    }

    // 2. BTRC Event
    console.log("\n2. Checking BTRC Event...")
    const btrc = await prisma.politicalEvent.findFirst({
        where: { title: { contains: 'বিটিআরসি' } }
    })
    if (btrc) {
        console.log(`Title: ${btrc.title}`)
        const sources = btrc.additionalSources ? JSON.parse(btrc.additionalSources) : []
        const hasDhakaPost = sources.find((s: any) => s.url.includes('421482'))
        console.log(`Has Dhaka Post (421482)? ${hasDhakaPost ? 'YES' : 'NO'}`)
    } else {
        console.log("❌ BTRC event NOT FOUND.")
    }

    // 3. Shahbagh Event
    console.log("\n3. Checking Shahbagh Event...")
    const shahbagh = await prisma.politicalEvent.findFirst({
        where: { title: { contains: 'বানিয়াচং থানা' } }
    })
    if (shahbagh) {
        console.log(`[FOUND] ${shahbagh.title}`)
        console.log(`URL: ${shahbagh.url}`)
    } else {
        console.log("❌ Shahbagh event NOT FOUND.")
    }
}

main().finally(() => prisma.$disconnect())
