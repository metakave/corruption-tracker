import { prisma } from '@/lib/db'
import HomeClient from '@/components/HomeClient'

// Revalidate stats every minute at most
export const revalidate = 60

async function getStats() {
    try {
        const today = new Date()
        const startOfDay = new Date(today.setHours(0, 0, 0, 0))
        const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7))

        // 1. Total Incidents
        const totalIncidents = await prisma.politicalEvent.count({
            where: { isPoliticalViolence: true }
        })

        // 2. Today's Count
        const todayCount = await prisma.politicalEvent.count({
            where: {
                isPoliticalViolence: true,
                dateOfIncident: {
                    gte: startOfDay
                }
            }
        })

        // 3. Deadliest (Last 7 Days)
        const deadliest = await prisma.politicalEvent.findFirst({
            where: {
                isPoliticalViolence: true,
                dateOfIncident: { gte: sevenDaysAgo }
            },
            orderBy: { killed: 'desc' },
            select: { title: true, killed: true, url: true } // Limit selection
        })

        // 4. Hotspot (Last 7 Days)
        const hotspotRaw = await prisma.politicalEvent.groupBy({
            by: ['district'],
            where: {
                isPoliticalViolence: true,
                dateOfIncident: { gte: sevenDaysAgo },
                district: { not: null }
            },
            _count: { id: true },
            orderBy: {
                _count: { id: 'desc' }
            },
            take: 1
        })

        const hotspot = hotspotRaw[0] ? {
            name: hotspotRaw[0].district,
            count: hotspotRaw[0]._count.id
        } : null

        return {
            totalIncidents,
            todayCount,
            deadliest: deadliest || null,
            hotspot,
            riskLevel: 'Moderate' // Default/Calculated placeholder
        }
    } catch (e) {
        console.error("Failed to fetch initial stats:", e)
        return {
            totalIncidents: 0,
            todayCount: 0,
            deadliest: null,
            hotspot: null,
            riskLevel: 'Error',
            error: true
        }
    }
}

export default async function Home() {
    const initialStats = await getStats()

    return <HomeClient initialStats={initialStats} />
}
