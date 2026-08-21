import type { Metadata } from 'next'
import FeedClient from './FeedClient'

export const metadata: Metadata = {
    title: "Real-Time Political Violence Feed | Bangladesh Violence Tracker",
    description: "Live stream of political violence reports, clashes, and social unrest across Bangladesh. Updated regularly from verified news sources.",
    openGraph: {
        title: "Real-Time Political Violence Feed | Bangladesh Violence Tracker",
        description: "Live stream of political violence reports, clashes, and social unrest across Bangladesh. Updated regularly from verified news sources.",
        type: 'website',
    }
}

export default function FeedPage() {
    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Live Political Violence Feed",
        "description": "Real-time stream of political violence reports from Bangladesh.",
        "url": "https://violencetracker.org/feed"
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />
            <FeedClient />
        </>
    )
}
