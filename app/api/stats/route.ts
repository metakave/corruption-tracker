import { NextResponse } from 'next/server'
import { getStats, prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const stats = await getStats()

        // Sector breakdowns
        const sectorBreakdowns = await prisma.corruptionEvent.groupBy({
            by: ['sectorOrMinistry'],
            where: { isCorruption: true, sectorOrMinistry: { not: null } },
            _count: { id: true },
            _sum: { amountInvolved: true },
            orderBy: { _count: { id: 'desc' } },
            take: 6
        })

        // Category breakdowns
        const categoryBreakdowns = await prisma.corruptionEvent.groupBy({
            by: ['category'],
            where: { isCorruption: true, category: { not: null } },
            _count: { id: true },
            _sum: { amountInvolved: true },
            orderBy: { _count: { id: 'desc' } },
            take: 6
        })

        // Investigating Agency breakdowns
        const agencyBreakdowns = await prisma.corruptionEvent.groupBy({
            by: ['investigatingAgency'],
            where: { isCorruption: true, investigatingAgency: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        })

        return NextResponse.json({
            ...stats,
            sectorBreakdowns,
            categoryBreakdowns,
            agencyBreakdowns
        })
    } catch (error: any) {
        console.error('Stats API error:', error)
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }
}
