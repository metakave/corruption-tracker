import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
    try {
        const [districts, categories, sectors, sources, eventCount, rawCount, rawUnprocessed] = await Promise.all([
            prisma.corruptionEvent.findMany({
                where: { district: { not: null } },
                distinct: ['district'],
                select: { district: true },
                orderBy: { district: 'asc' },
            }),
            prisma.corruptionEvent.findMany({
                where: { category: { not: null } },
                distinct: ['category'],
                select: { category: true },
                orderBy: { category: 'asc' },
            }),
            prisma.corruptionEvent.findMany({
                where: { sectorOrMinistry: { not: null } },
                distinct: ['sectorOrMinistry'],
                select: { sectorOrMinistry: true },
                orderBy: { sectorOrMinistry: 'asc' },
            }),
            prisma.rawNewsArticle.findMany({
                distinct: ['source'],
                select: { source: true },
                orderBy: { source: 'asc' },
            }),
            prisma.corruptionEvent.count(),
            prisma.rawNewsArticle.count(),
            prisma.rawNewsArticle.count({ where: { isProcessed: false } }),
        ])

        return NextResponse.json({
            districts: districts.map((d) => d.district).filter(Boolean),
            categories: categories.map((c) => c.category).filter(Boolean),
            sectors: sectors.map((s) => s.sectorOrMinistry).filter(Boolean),
            sources: sources.map((s) => s.source).filter(Boolean),
            counts: { events: eventCount, raw: rawCount, rawUnprocessed },
        })
    } catch (err) {
        console.error('[download/options] failed:', err)
        return NextResponse.json({ error: 'failed to load options' }, { status: 500 })
    }
}
