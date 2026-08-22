import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const event = await prisma.corruptionEvent.findUnique({ where: { id } })

    if (!event) return { title: 'Event Not Found' }

    const date = formatDate(event.dateOfIncident || event.publishedAt)
    const title = `${event.title} - Corruption Tracker`
    const desc = event.summary ? event.summary.substring(0, 160) : `Detailed report of corruption incident in ${event.district || 'Bangladesh'} on ${date}.`

    return {
        title,
        description: desc,
        alternates: {
            canonical: `https://violencetracker.org/events/${id}`,
        },
        openGraph: {
            title,
            description: desc,
            type: 'article',
            url: `https://violencetracker.org/events/${id}`,
            publishedTime: event.publishedAt.toISOString(),
            section: 'Corruption Intelligence',
            tags: JSON.parse(event.tags || '[]'),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description: desc,
        }
    }
}

export default async function EventDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const event = await prisma.corruptionEvent.findUnique({
        where: { id }
    })

    if (!event) notFound()

    return (
        <main className="bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                    <div className="mb-4">
                        <Link href="/" className="text-blue-500 hover:underline">&larr; Back to Map</Link>
                    </div>


                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>

                    {/* Structured Data for SEO */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "NewsArticle",
                                "headline": event.title,
                                "description": event.summary?.substring(0, 160),
                                "datePublished": event.publishedAt.toISOString(),
                                "dateModified": event.createdAt.toISOString(),
                                "author": {
                                    "@type": "Organization",
                                    "name": event.source
                                },
                                "publisher": {
                                    "@type": "Organization",
                                    "name": "Bangladesh Violence Tracker",
                                    "logo": {
                                        "@type": "ImageObject",
                                        "url": "https://violencetracker.org/logo.png"
                                    }
                                }
                            })
                        }}
                    />

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="bg-emerald-50 text-emerald-700 font-medium px-3 py-1 rounded-full border border-emerald-200">{event.sectorOrMinistry || 'General Sector'}</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{event.category || 'Corruption'}</span>
                    </div>
                    <div className="flex items-center text-gray-500 mb-4">
                        <span>{formatDate(event.dateOfIncident || event.publishedAt)}</span>
                        <span className="mx-2">•</span>
                        <span>{event.locationText || event.district || 'Bangladesh'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 bg-amber-50 p-4 rounded-md border border-amber-200">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 uppercase tracking-wide">Amount Involved</p>
                            <p className="text-2xl font-bold text-amber-700">{event.amountFormatted || (event.amountInvolved ? `৳${event.amountInvolved.toLocaleString()}` : 'Unspecified')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 uppercase tracking-wide">Legal Status</p>
                            <p className="text-2xl font-bold text-slate-800 capitalize">{event.legalStatus || 'Allegation'}</p>
                        </div>
                    </div>

                    <div className="prose max-w-none text-gray-700 mb-8">
                        <h3 className="text-xl font-semibold mb-2">Summary</h3>
                        <p>{event.summary}</p>
                    </div>


                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Sources</h3>
                        <div className="flex flex-col gap-2">
                            {/* Primary Source */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {event.source}
                                </span>
                                <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                                    {event.url}
                                </a>
                            </div>

                            {/* Additional Sources */}
                            {(() => {
                                try {
                                    const additional = event.additionalSources ? JSON.parse(event.additionalSources) : []
                                    return additional.map((s: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                {s.source || 'Additional Source'}
                                            </span>
                                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                                                {s.url}
                                            </a>
                                        </div>
                                    ))
                                } catch (e) {
                                    return null
                                }
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
