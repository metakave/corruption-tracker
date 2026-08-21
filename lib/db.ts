import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getStats() {
    try {
        const today = new Date()
        const startOfDay = new Date(new Date(today).setHours(0, 0, 0, 0))
        const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7))

        // 1. Total Corruption Incidents
        const totalIncidents = await prisma.corruptionEvent.count({
            where: { isCorruption: true }
        })

        // 2. Today's Incidents
        const todayCount = await prisma.corruptionEvent.count({
            where: {
                isCorruption: true,
                publishedAt: { gte: startOfDay }
            }
        })

        // 3. Largest Financial Scam (All time or last 30 days)
        const largestScam = await prisma.corruptionEvent.findFirst({
            where: {
                isCorruption: true,
                amountInvolved: { not: null }
            },
            orderBy: { amountInvolved: 'desc' },
            select: { title: true, amountFormatted: true, amountInvolved: true, url: true, sectorOrMinistry: true }
        })

        // 4. Total Financial Loss Tracked (Crores)
        const aggregations = await prisma.corruptionEvent.aggregate({
            where: { isCorruption: true },
            _sum: { amountInvolved: true }
        })
        const totalFinancialLossBDT = aggregations._sum.amountInvolved || 0
        const totalLossCrores = (totalFinancialLossBDT / 10000000).toFixed(1)

        // 5. Top Corrupted Sector / Ministry
        const sectorGroups = await prisma.corruptionEvent.groupBy({
            by: ['sectorOrMinistry'],
            where: {
                isCorruption: true,
                sectorOrMinistry: { not: null }
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 1
        })
        const topSector = sectorGroups[0] ? {
            name: sectorGroups[0].sectorOrMinistry,
            count: sectorGroups[0]._count.id
        } : null

        // 6. District Hotspot
        const hotspotRaw = await prisma.corruptionEvent.groupBy({
            by: ['district'],
            where: {
                isCorruption: true,
                district: { not: null }
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 1
        })

        const hotspot = hotspotRaw[0] ? {
            name: hotspotRaw[0].district,
            count: hotspotRaw[0]._count.id
        } : null

        return {
            totalIncidents,
            todayCount,
            totalLossCrores,
            largestScam,
            topSector,
            hotspot,
            riskLevel: totalIncidents > 50 ? 'High' : 'Moderate'
        }
    } catch (e) {
        console.error("Failed to fetch initial corruption stats:", e)
        return {
            totalIncidents: 0,
            todayCount: 0,
            totalLossCrores: "0.0",
            largestScam: null,
            topSector: null,
            hotspot: null,
            riskLevel: 'Moderate',
            error: true
        }
    }
}
