import { getStats } from '@/lib/db'
import type { Metadata } from 'next'
import HomeClient from '@/components/HomeClient'

export async function generateMetadata(): Promise<Metadata> {
    const title = "Bangladesh Corruption Tracker | Real-Time Financial Crime & Graft Intelligence"
    const description = "The leading platform for monitoring corruption, fund embezzlement, money laundering, and tender fraud in Bangladesh. Access verified cases, district maps, and AI-driven media analysis."

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            locale: 'bn_BD',
            siteName: 'Bangladesh Corruption Tracker'
        },
        twitter: {
            card: 'summary',
            title,
            description,
        }
    }
}

export default async function Home() {
    const initialStats = await getStats()

    return (
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-black transition-colors relative">
            <HomeClient initialStats={initialStats} />
        </main>
    )
}
