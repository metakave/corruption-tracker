'use client'

import React, { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { formatDate } from '@/lib/utils'
import { ExternalLink, ShieldCheck, AlertTriangle, ShieldAlert, FileText, Link as LinkIcon } from 'lucide-react'

interface Event {
    id: string
    title: string
    url: string
    source: string | null
    additionalSources: string | null
    politicalParties: string | null
    publishedAt: string
    locationText: string | null
    district: string | null
    summary: string | null
    killed: number | null
    injured: number | null
    severityScore: number | null
    confidence: number | null
    tags: string | null
    affectedInfrastructure: string | null
    dateOfIncident: string | null
}

export default function RecentFeed() {
    const { t } = useLanguage()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/events')
            .then(res => res.json())
            .then(json => {
                const data = json.data || json
                if (Array.isArray(data)) {
                    setEvents(data.slice(0, 15))
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) {
        return <div className="p-4 text-center text-sm text-gray-500">{t('loading')}</div>
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full flex flex-col transition-colors">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('recent_incidents')}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('latest_reports')}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                {events.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">{t('no_incidents')}</div>
                ) : (
                    <div className="divide-y divide-black dark:divide-white">
                        {events.map(event => <EventItem key={event.id} event={event} />)}
                    </div>
                )}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg text-center transition-colors">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    Showing {events.length} most recent incidents
                </span>
            </div>
        </div>
    )
}

function EventItem({ event }: { event: Event }) {
    // Parse JSON fields
    let parties: string[] = []
    let tags: string[] = []
    let extraSources: any[] = []

    try {
        if (event.politicalParties) parties = JSON.parse(event.politicalParties)
        if (event.tags) tags = JSON.parse(event.tags)
        if (event.additionalSources) {
            const rawSources = JSON.parse(event.additionalSources)
            // Deduplicate by URL
            extraSources = rawSources.filter((s: any, index: number, self: any[]) =>
                index === self.findIndex((t: any) => (
                    t.url === s.url
                ))
            )
        }
    } catch (e) { }

    const location = event.locationText || event.district || 'Unknown'
    const confidence = event.confidence ? Math.round(event.confidence * 100) : 0

    // Traffic Light Logic
    let confidenceColor = 'bg-gray-100 text-gray-600'
    let confidenceIcon = <AlertTriangle className="w-3 h-3" />
    if (confidence >= 80) {
        confidenceColor = 'bg-green-100 text-green-700 border-green-200'
        confidenceIcon = <ShieldCheck className="w-3 h-3" />
    } else if (confidence >= 50) {
        confidenceColor = 'bg-yellow-100 text-yellow-700 border-yellow-200'
        confidenceIcon = <AlertTriangle className="w-3 h-3" />
    } else {
        confidenceColor = 'bg-red-100 text-red-700 border-red-200'
        confidenceIcon = <ShieldAlert className="w-3 h-3" />
    }

    return (
        <div className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
            {/* Header: Parties + Confidence */}
            <div className="flex justify-between items-start gap-2 mb-3">
                <div className="flex gap-2 flex-wrap items-center">
                    {parties.length > 0 && (
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/50">
                            {parties[0]}
                        </span>
                    )}
                    {/* Confidence Badge (Dashboard) */}
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${confidenceColor}`}>
                        {confidenceIcon}
                        {confidence}% AI Score
                    </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatDate(event.dateOfIncident || event.publishedAt)}
                </span>
            </div>

            {/* Title */}
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-relaxed">
                {event.title}
            </h4>

            {/* Summary */}
            {event.summary && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 bg-yellow-50 dark:bg-yellow-900/10 border-l-2 border-yellow-400 dark:border-yellow-600 p-3 rounded">
                    {event.summary}
                </p>
            )}

            {/* Stats Check */}
            <div className="flex items-center gap-4 text-xs mb-4 border-t border-b border-dashed border-gray-200 dark:border-gray-800 py-2.5">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <span>📍</span> {location}
                </div>
                {(event.killed || 0) > 0 && (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                        <span>💀</span> {event.killed}
                    </div>
                )}
                {(event.injured || 0) > 0 && (
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                        <span>🤕</span> {event.injured}
                    </div>
                )}
            </div>

            {/* Actions: Source - Constant Display */}
            <div className="mt-4">
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded text-xs space-y-2">
                    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-blue-100 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Evidence & Verification
                    </div>

                    {/* Primary Source */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Primary Report:
                        </span>
                        <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                        >
                            {event.source || 'News Report'} <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Additional Sources (Fact Check Style) */}
                    {extraSources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800/50">
                            <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" /> Corroborating Reports ({extraSources.length}):
                            </div>
                            <div className="space-y-1 pl-1">
                                {extraSources.map((s, idx) => (
                                    <div key={idx} className="flex items-start gap-2 py-1">
                                        <span className="text-gray-400 dark:text-gray-600 mt-1">•</span>
                                        <div className="flex-1 min-w-0">
                                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">{s.source}:</span>
                                                <span className="text-xs text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate block">
                                                    {s.title || 'Read Full Report'}
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100 dark:border-blue-800/50">
                        <span className="text-gray-600 dark:text-gray-400">AI Confidence:</span>
                        <span className="font-mono bg-white dark:bg-black text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900">{event.confidence?.toFixed(2) || 'N/A'} (approx {confidence}%)</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

