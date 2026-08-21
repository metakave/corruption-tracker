
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const targetUrls = [
        'https://www.prothomalo.com/bangladesh/crime/l825ii35tm',
        'https://www.dhakapost.com/national/421482',
        'https://www.dhakapost.com/national/421444',
        'https://www.dhakapost.com/national/421432'
    ]

    console.log("Searching for specific URLs in DB...")

    const events = await prisma.politicalEvent.findMany()

    const matches: Record<string, any> = {}

    for (const e of events) {
        let isMatch = false
        if (targetUrls.includes(e.url)) isMatch = true

        if (e.additionalSources) {
            try {
                const s = JSON.parse(e.additionalSources)
                if (s.some((src: any) => targetUrls.includes(src.url))) {
                    isMatch = true
                }
            } catch (err) { }
        }

        if (isMatch) {
            console.log(`[MATCH] Event ID: ${e.id} | Title: ${e.title}`)
            console.log(`URL: ${e.url}`)
            console.log(`Sources: ${e.additionalSources}`)
            console.log('---')
        }
    }
}

main()
    .finally(() => prisma.$disconnect())
