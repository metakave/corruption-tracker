import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { toBDDateStart } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const now = new Date()
        const startOfToday = toBDDateStart(now)

        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        // Parallelize queries for performance
        const [totalIncidents, todayCount, groups, deadliestEvent, riskDistrictRaw] = await Promise.all([
            prisma.politicalEvent.count(),
            prisma.politicalEvent.count({
                where: {
                    OR: [
                        { dateOfIncident: { gte: startOfToday } },
                        {
                            AND: [
                                { dateOfIncident: null },
                                { publishedAt: { gte: startOfToday } }
                            ]
                        }
                    ]
                }
            }),
            prisma.politicalEvent.groupBy({
                by: ['politicalParties'],
                _count: { id: true }
            }),
            prisma.politicalEvent.findFirst({
                where: { publishedAt: { gte: sevenDaysAgo } },
                orderBy: [
                    { killed: 'desc' },
                    { severityScore: 'desc' }
                ]
            }),
            prisma.politicalEvent.groupBy({
                by: ['district'],
                where: { publishedAt: { gte: sevenDaysAgo } },
                _count: { district: true },
                orderBy: { _count: { district: 'desc' } },
                take: 1
            })
        ])

        // Find party with max incidents (Legacy logic for compatibility, though we just use groups now)
        let activeParty = 'N/A'
        let maxCount = 0
        groups.forEach(g => {
            if (g._count.id > maxCount && g.politicalParties !== 'Unknown Party') {
                maxCount = g._count.id
                try {
                    const parsed = JSON.parse(g.politicalParties || '[]')
                    activeParty = Array.isArray(parsed) ? parsed.join(', ') : g.politicalParties || 'N/A'
                } catch (e) {
                    activeParty = g.politicalParties || 'N/A'
                }
            }
        })

        // Risk Level Logic
        let riskLevel = 'Low'
        if (todayCount > 2 || totalIncidents > 50) riskLevel = 'Moderate'
        if (todayCount > 5 || totalIncidents > 100) riskLevel = 'High'

        // Format Deadliest Event
        const deadliest = deadliestEvent ? {
            title: deadliestEvent.title,
            killed: deadliestEvent.killed,
            url: deadliestEvent.url
        } : null

        // Format Hotspot
        const hotspot = riskDistrictRaw[0] ? {
            name: riskDistrictRaw[0].district,
            count: riskDistrictRaw[0]._count.district
        } : null

        return NextResponse.json({
            totalIncidents,
            todayCount,     // New
            deadliest,      // New
            hotspot,        // Updated structure
            riskLevel,
            activeParty,
            partyDistribution: groups
        })
    } catch (error) {
        console.error("Stats API Error:", error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
