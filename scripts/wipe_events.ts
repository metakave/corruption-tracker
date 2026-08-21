
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.politicalEvent.count()
    console.log(`⚠️  WARNING: You are about to DELETE all ${count} Political Events.`)
    console.log("This action cannot be undone unless you have a backup.")
    console.log("Waiting 5 seconds before proceeding... (Ctrl+C to cancel)")

    await new Promise(r => setTimeout(r, 5000))

    console.log("🗑️  Deleting...")
    const { count: deleted } = await prisma.politicalEvent.deleteMany()
    console.log(`✅ Deleted ${deleted} events. The PoliticalEvent table is now empty.`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
