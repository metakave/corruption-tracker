import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// Party/actor fields are stored as JSON arrays or plain strings — flatten them.
function collectParties(values: (string | null)[], counts: Map<string, number>): void {
    for (const v of values) {
        if (!v) continue
        let items: string[]
        try {
            const parsed: unknown = JSON.parse(v)
            items = Array.isArray(parsed) ? parsed.map((x) => String(x)) : [v]
        } catch {
            items = [v]
        }
        for (const raw of items) {
            const name = raw.trim()
            if (name && name.length <= 40) counts.set(name, (counts.get(name) || 0) + 1)
        }
    }
}

export async function GET(): Promise<NextResponse> {
    try {
        const [districts, categories, sources, eventCount, rawCount, rawUnprocessed, partyRows] = await Promise.all([
            prisma.politicalEvent.findMany({
                where: { district: { not: null } },
                distinct: ['district'],
                select: { district: true },
                orderBy: { district: 'asc' },
            }),
            prisma.politicalEvent.findMany({
                where: { category: { not: null } },
                distinct: ['category'],
                select: { category: true },
                orderBy: { category: 'asc' },
            }),
            prisma.rawNewsArticle.findMany({
                distinct: ['source'],
                select: { source: true },
                orderBy: { source: 'asc' },
            }),
            prisma.politicalEvent.count(),
            prisma.rawNewsArticle.count(),
            prisma.rawNewsArticle.count({ where: { isProcessed: false } }),
            prisma.politicalEvent.findMany({
                select: { politicalParties: true, victimParties: true, perpetratorParties: true },
            }),
        ])

        const partyCounts = new Map<string, number>()
        for (const r of partyRows) {
            collectParties([r.politicalParties, r.victimParties, r.perpetratorParties], partyCounts)
        }
        const parties = Array.from(partyCounts.entries())
            .filter(([, c]) => c >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 60)
            .map(([name]) => name)
            .sort((a, b) => a.localeCompare(b, 'bn'))

        return NextResponse.json({
            districts: districts.map((d) => d.district).filter(Boolean),
            categories: categories.map((c) => c.category).filter(Boolean),
            sources: sources.map((s) => s.source).filter(Boolean),
            parties,
            counts: { events: eventCount, raw: rawCount, rawUnprocessed },
        })
    } catch (err) {
        console.error('[download/options] failed:', err)
        return NextResponse.json({ error: 'failed to load options' }, { status: 500 })
    }
}
