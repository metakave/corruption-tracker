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
        '/business',
        '/statistics/tfgbv',
        '/faq',
        '/about',
        '/insights/bangladesh-election-violence-dhaka-stream-interview',
        '/insights/human-history-political-violence',
        '/insights/election-violence-south-asia-nations',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: (route === '/feed' || route === '/map' ? 'hourly' : 'daily') as 'hourly' | 'daily',
        priority: route === '' ? 1 : (route === '/feed' || route === '/map') ? 0.9 : 0.8,
    }))

    // 2. Dynamic Event Routes (Fetch ALL)
    // Limited to 2000 recent events for performance, can paginate if needed later
    const events = await prisma.corruptionEvent.findMany({
        where: { isCorruption: true },
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
