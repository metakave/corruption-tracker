'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExternalLink, Clock, MapPin, AlertTriangle, Activity, Menu, X, ShieldCheck, ChevronUp, ChevronDown, ShieldAlert } from 'lucide-react'
import { BD_DISTRICTS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

// Types
type PoliticalEvent = {
    id: string
    title: string
    publishedAt: string
    dateOfIncident: string | null
    district: string | null
    incident_type: string
    killed: number
    injured: number
    severityScore: number
    url: string
    summary: string | null
    tags: string
    politicalParties: string | null
    locationText: string | null
    source: string | null
    additionalSources: string | null
    confidence: number | null
}

const POLLING_INTERVAL = 30000 // 30 Seconds

export default function FeedClient() {
    const [events, setEvents] = useState<PoliticalEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const [isPolling, setIsPolling] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Simple filter - Just one "Focus Area"
    const [selectedDistrict, setSelectedDistrict] = useState('All')

    const fetchData = async () => {
        try {
            // Force recent (last 24 hours implied by sort/limit usually, but here we strip timeRange to get latest from stream)
            const params = new URLSearchParams({
                limit: '50', // Get deeper history for the feed
                // If district selected
                ...(selectedDistrict !== 'All' ? { district: selectedDistrict } : {})
            })

            const res = await fetch(`/api/events?${params}`)
            const json = await res.json()

            if (json.data) {
                // Client-side sort to be absolutely sure
                const sorted = json.data.sort((a: PoliticalEvent, b: PoliticalEvent) => {
                    const dateA = new Date(a.dateOfIncident || a.publishedAt).getTime()
                    const dateB = new Date(b.dateOfIncident || b.publishedAt).getTime()
                    return dateB - dateA
                })
                setEvents(sorted)
                setLastUpdated(new Date())
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Initial Fetch & Polling
    useEffect(() => {
        fetchData()

        let interval: NodeJS.Timeout
        if (isPolling) {
            interval = setInterval(fetchData, POLLING_INTERVAL)
        }
        return () => clearInterval(interval)
    }, [isPolling, selectedDistrict])


    // Helpers


    const getSeverityColor = (score: number) => {
        if (score >= 8) return 'border-l-4 border-l-red-600 bg-red-50 dark:bg-red-950/20'
        if (score >= 5) return 'border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/10'
        return 'border-l-4 border-l-blue-500 bg-white dark:bg-gray-900'
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-200 p-4 md:p-8 transition-colors">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 relative">

                {/* Mobile Header for Sidebar Toggle */}
                <div className="lg:hidden flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Activity className="text-red-600 animate-pulse w-5 h-5" /> Live Wire
                    </h1>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Left Sidebar: Controls & Status */}
                {/* Sidebar Overlay for Mobile */}
                <div className={`
                    fixed inset-0 z-50 bg-white dark:bg-black/95 p-6 overflow-y-auto transition-transform duration-300 lg:hidden shadow-xl
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Filters</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-900 rounded-full text-gray-600 dark:text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                                Monitor Sector
                            </label>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => { setSelectedDistrict(e.target.value); setIsSidebarOpen(false); }}
                                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            >
                                <option value="All">All Bangladesh</option>
                                {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>



                        <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                            Last synced: {lastUpdated.toLocaleTimeString()}
                        </div>

                        <Link href="/data" className="block text-center w-full py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 transition-colors font-medium">
                            View Historical Archive →
                        </Link>
                    </div>
                </div>

                {/* Desktop Sidebar (Static) */}
                <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-20 h-fit">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Activity className="text-red-600 animate-pulse" /> Live Wire
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Real-time stream of political violence reports as they happen.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                            Monitor Sector
                        </label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        >
                            <option value="All">All Bangladesh</option>
                            {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>



                    <div className="text-xs px-1 mb-2">
                        <span className="block text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold mb-1">Current Data</span>
                        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-md border border-blue-100 dark:border-blue-900/30 font-bold text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(new Date())}
                        </div>
                    </div>

                    <Link href="/data" className="block text-center w-full py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 transition-colors bg-gray-50 dark:bg-black font-medium">
                        View Historical Archive →
                    </Link>
                </div>

                {/* Right Column: The Feed Stream */}
                <div className="lg:col-span-3">
                    {loading && events.length === 0 ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"></div>)}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 divide-y divide-black dark:divide-white overflow-hidden">
                            {events.map((event) => (
                                <FeedEventItem key={event.id} event={event} />
                            ))}

                            {events.length === 0 && (
                                <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-900/20">
                                    <div className="mb-2">📡</div>
                                    No live reports in this sector momentarily.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Helper Component for Feed Event Items
function FeedEventItem({ event }: { event: PoliticalEvent }) {
    let parties: string[] = []
    let extraSources: any[] = []

    try {
        if (event.politicalParties) parties = JSON.parse(event.politicalParties)
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

    // Confidence Logic (Adaptive for 0-1, 1-10, or 0-100)
    let rawConfidence = event.confidence || 0
    let confidence = 0
    if (rawConfidence <= 1) confidence = Math.round(rawConfidence * 100)
    else if (rawConfidence <= 10) confidence = Math.round(rawConfidence * 10)
    else confidence = Math.round(rawConfidence) // Assume already percentage
    if (confidence > 100) confidence = 100

    // Traffic Light Logic
    let confidenceColor = 'border-blue-100 dark:border-blue-900 bg-white dark:bg-black text-gray-900 dark:text-gray-100'
    let confidenceIcon = <AlertTriangle className="w-3 h-3 text-amber-500" />

    if (confidence >= 80) {
        confidenceColor = 'border-green-200 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
        confidenceIcon = <ShieldCheck className="w-3 h-3" />
    } else if (confidence >= 50) {
        confidenceColor = 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
        confidenceIcon = <AlertTriangle className="w-3 h-3" />
    } else {
        confidenceColor = 'border-red-200 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        confidenceIcon = <ShieldAlert className="w-3 h-3" />
    }

    // Helper from parent
    const getSeverityColor = (score: number) => {
        if (score >= 8) return 'border-l-4 border-l-red-600'
        if (score >= 5) return 'border-l-4 border-l-orange-500'
        return 'border-l-4 border-l-blue-500'
    }

    return (
        <div className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${getSeverityColor(event.severityScore)}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded shadow-sm">
                        <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {formatDate(event.dateOfIncident || event.publishedAt)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full w-fit shadow-sm">
                    <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    {event.district || 'Unknown Location'}
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">
                <a href={event.url} target="_blank" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {event.title}
                </a>
            </h3>

            {event.summary && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 bg-white dark:bg-black/20 p-3 rounded border border-gray-100 dark:border-white/5 italic">
                    {event.summary}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-200 dark:border-gray-800 mt-2">
                <div className="flex flex-wrap gap-2">
                    {parties.slice(0, 3).map((p, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-medium">
                            {p}
                        </span>
                    ))}
                    {(event.killed > 0 || event.injured > 0) && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                            <AlertTriangle className="w-3 h-3" />
                            {event.killed} Killed, {event.injured} Injured
                        </span>
                    )}
                </div>
            </div>

            {/* Actions: Source - Constant Display */}
            <div className="mt-4">
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded text-xs space-y-2">
                    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-blue-100 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Evidence & Sources
                    </div>

                    {/* Primary Source */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Primary Source ({event.source || 'News'}):</span>
                        <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                        >
                            Read Report <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Additional Sources (Fact Check Style) */}
                    {extraSources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800/50">
                            <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Additional Coverage ({extraSources.length}):
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
                        <span className={`font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${confidenceColor}`}>
                            {confidenceIcon}
                            {confidence}%
                        </span>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-500 mt-1 italic flex items-center gap-1">
                        <li className="list-none">✨</li>
                        This event was automatically analyzed by AI. Always verify with primary sources.
                    </div>
                </div>
            </div>
        </div>
    )
}
