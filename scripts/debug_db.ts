
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function debugDB() {
    const url = process.env.DATABASE_URL || 'UNDEFINED'
    console.log(`Database URL (Masked): ${url.replace(/:[^:@]*@/, ':****@')}`)

    // Check Total Count
    const totalRaw = await prisma.rawNewsArticle.count()
    console.log(`Total RawNewsArticle Count: ${totalRaw}`)

    // Check ID range
    const maxId = await prisma.rawNewsArticle.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true, scrapedAt: true, publishedAt: true }
    })
    console.log(`Max ID: ${maxId?.id}`)
    console.log(`Latest Article Published: ${maxId?.publishedAt}`)
}

debugDB()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
