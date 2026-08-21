import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

// Force dynamic generation to ensure new events appear immediately
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://violencetracker.org'

    // 1. Static Routes
    const routes = [
        '',
        '/map',
        '/feed',
        '/data',
        '/analytics',
        '/about',
        '/faq',
        '/business',
        '/statistics/tfgbv',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // 2. Dynamic Event Routes (Fetch ALL)
    // Limited to 2000 recent events for performance, can paginate if needed later
    const events = await prisma.politicalEvent.findMany({
        where: { isPoliticalViolence: true },
        select: { id: true, updatedAt: true, publishedAt: true },
        orderBy: { createdAt: 'desc' },
        take: 2000
    })

    const eventUrls = events.map((event) => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: event.updatedAt || event.publishedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...routes, ...eventUrls]
}
