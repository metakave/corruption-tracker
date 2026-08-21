import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PARTY_CATEGORIES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        console.log('--- ANALYTICS API START ---')
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Parallel Data Fetching
        const [
            allEventsLight, // For Party Analysis & Total Counts (Lightweight)
            recentEvents,   // For 30-day Trend
            districtStats   // For Top Districts
        ] = await Promise.all([
            // 1. Fetch ALL events (lightweight) for Party Analysis & Totals
            prisma.politicalEvent.findMany({
                select: {
                    id: true,
                    politicalParties: true,
                    title: true,
                    summary: true,
                    killed: true,
                    injured: true
                }
            }),

            // 2. Fetch events from last 30 days for Trend
            prisma.politicalEvent.findMany({
                where: {
                    OR: [
                        { dateOfIncident: { gte: thirtyDaysAgo } },
                        { publishedAt: { gte: thirtyDaysAgo } }
                    ]
                },
                select: {
                    dateOfIncident: true,
                    publishedAt: true
                }
            }),

            // 3. Group by District (Top 15 to be safe)
            prisma.politicalEvent.groupBy({
                by: ['district'],
                _count: {
                    id: true
                },
                orderBy: {
                    _count: {
                        id: 'desc'
                    }
                },
                take: 15,
                where: {
                    district: { not: null }
                }
            })
        ])

        // --- Processing Data ---

        // 1. Total Casualties
        let totalKilled = 0
        let totalInjured = 0
        allEventsLight.forEach(e => {
            totalKilled += e.killed || 0
            totalInjured += e.injured || 0
        })

        // 2. Party Analysis
        const categoryCounts: Record<string, number> = {}
        PARTY_CATEGORIES.forEach(c => categoryCounts[c.label] = 0)
        categoryCounts["Uncategorized"] = 0

        // Helper for Regex Escaping
        const escapeRegExp = (string: string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        allEventsLight.forEach(e => {
            // Exclude summary to reduce noise (e.g. "Police arrested..." shouldn't count as Police violence)
            const textToSearch = ((e.politicalParties || '') + ' ' + (e.title || '')).toLowerCase()
            let matched = false

            for (const cat of PARTY_CATEGORIES) {
                let isMatch = false

                for (const k of cat.keywords) {
                    const kEscaped = escapeRegExp(k.toLowerCase())
                    // Strict boundary matching: Start/End or whitespace or punctuation
                    // Includes Bengali Danda (।) (\u0964)
                    const regex = new RegExp(`(?:^|\\s|[.,!?()"\\-'\\u0964])${kEscaped}(?:$|\\s|[.,!?()"\\-'\\u0964])`, 'u')

                    if (regex.test(textToSearch)) {
                        isMatch = true
                        break
                    }
                }

                if (isMatch) {
                    categoryCounts[cat.label]++
                    matched = true
                }
            }
            if (!matched) categoryCounts["Uncategorized"]++
        })

        // 3. Daily Trend (Last 30 Days)
        const dates: Record<string, number> = {}
        // Initialize last 30 days with 0
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            dates[formatDate(d)] = 0
        }
        // Fill from recent events
        recentEvents.forEach(e => {
            const dStr = formatDate(e.dateOfIncident || e.publishedAt)
            if (dates[dStr] !== undefined) {
                dates[dStr]++
            }
        })

        // 4. District Stats
        const topDistricts = districtStats
            .filter(d => d.district && d.district !== 'Unknown' && d.district !== 'Bangladesh') // cleanup
            .slice(0, 10)
            .map(d => ({
                district: d.district,
                count: d._count.id
            }))


        return NextResponse.json({
            stats: {
                totalEvents: allEventsLight.length,
                totalKilled,
                totalInjured,
                trend: dates,
                districts: topDistricts,
                parties: categoryCounts
            }
        })

    } catch (error) {
        console.error('Analytics API Error:', error)
        return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 })
    }
}
