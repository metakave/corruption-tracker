import { NextResponse } from 'next/server'
import { getStats, prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const timeRange = searchParams.get('timeRange') || '7d'

        let dateFilter: any = undefined
        let days = 7
        if (timeRange !== 'all') {
            if (timeRange === '7d') days = 7
            else if (timeRange === '30d') days = 30
            else if (timeRange === '3m') days = 90
            else if (timeRange === '1y') days = 365
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            dateFilter = { gte: startDate }
        } else {
            days = 36500 // roughly all time (100 years)
        }

        const baseWhere = {
            isCorruption: true,
            ...(dateFilter ? { publishedAt: dateFilter } : {})
        }

        const stats = await getStats(days)

        // Sector breakdowns
        const sectorBreakdowns = await prisma.corruptionEvent.groupBy({
            by: ['sectorOrMinistry'],
            where: { ...baseWhere, sectorOrMinistry: { not: null } },
            _count: { id: true },
            _sum: { amountInvolved: true },
            orderBy: { _count: { id: 'desc' } },
            take: 8
        })

        // Category breakdowns
        const categoryBreakdowns = await prisma.corruptionEvent.groupBy({
            by: ['category'],
            where: { ...baseWhere, category: { not: null } },
            _count: { id: true },
            _sum: { amountInvolved: true },
            orderBy: { _count: { id: 'desc' } },
            take: 8
        })

        // Investigating Agency breakdowns
        const agencyBreakdowns = await prisma.corruptionEvent.groupBy({
            by: ['investigatingAgency'],
            where: { ...baseWhere, investigatingAgency: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 6
        })

        // District breakdowns
        const districtBreakdowns = await prisma.corruptionEvent.groupBy({
            by: ['district'],
            where: { ...baseWhere, district: { not: null } },
            _count: { id: true },
            _sum: { amountInvolved: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        })

        // Legal Status breakdowns
        const statusBreakdowns = await prisma.corruptionEvent.groupBy({
            by: ['legalStatus'],
            where: { ...baseWhere, legalStatus: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 6
        })

        // Recent High-profile events
        const recentEvents = await prisma.corruptionEvent.findMany({
            where: baseWhere,
            orderBy: { publishedAt: 'desc' },
            take: 10,
            select: {
                id: true,
                title: true,
                summary: true,
                category: true,
                sectorOrMinistry: true,
                amountFormatted: true,
                amountInvolved: true,
                investigatingAgency: true,
                district: true,
                legalStatus: true,
                publishedAt: true,
                url: true,
                source: true
            }
        })

        return NextResponse.json({
            ...stats,
            sectorBreakdowns,
            categoryBreakdowns,
            agencyBreakdowns,
            districtBreakdowns,
            statusBreakdowns,
            recentEvents
        })
    } catch (error: any) {
        console.error('Stats API error:', error)
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }
}
