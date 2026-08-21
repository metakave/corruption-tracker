'use client'

import { MapContainer, TileLayer, CircleMarker, useMap, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import { formatDate } from '@/lib/utils'
import { X, Filter, MapPin, ChevronRight } from 'lucide-react'
import { VIOLENCE_CATEGORIES, PARTY_CATEGORIES } from '@/lib/constants'
import DateRangeFilter from '../app/admin/analysis/components/DateRangeFilter'

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface AnalyticsEvent {
    id: string;
    title: string;
    date: string;
    district: string;
    killed: number;
    injured: number;
    category?: string;
    politicalParties: string[];
    latitude?: number;
    longitude?: number;
    url?: string;
    summary?: string;
}

interface AnalyticsMapProps {
    events: AnalyticsEvent[];
    startDate: string;
    endDate: string;
    onDateChange: (start: string, end: string) => void;
}

// Heatmap Component
function HeatmapLayer({ events }: { events: AnalyticsEvent[] }) {
    const map = useMap()

    useEffect(() => {
        setTimeout(() => { map.invalidateSize() }, 100)
    }, [map])

    useEffect(() => {
        if (!map || events.length === 0) return

        const size = map.getSize()
        if (size.x === 0 || size.y === 0) return

        const points = events
            .filter(e => e.latitude && e.longitude)
            .map(e => [
                e.latitude!,
                e.longitude!,
                ((e.killed || 0) + (e.injured || 0) * 0.5) * 100
            ]) as L.HeatLatLngTuple[]

        if (points.length === 0) return

        // @ts-ignore
        const heat = L.heatLayer(points, {
            radius: 30,
            blur: 20,
            maxZoom: 10,
            max: 1000,
            gradient: {
                0.2: '#fdba74',
                0.4: '#fb923c',
                0.6: '#ef4444',
                0.8: '#b91c1c',
                1.0: '#7f1d1d'
            }
        })

        heat.addTo(map)

        return () => {
            map.removeLayer(heat)
        }
    }, [map, events])

    return null
}

function getMarkerColor(killed: number, injured: number): string {
    const total = killed + injured
    if (total === 0) return '#94a3b8'
    if (total >= 10) return '#991b1b'
    if (total >= 5) return '#dc2626'
    if (total >= 3) return '#f87171'
    return '#fca5a5'
}

// Helper to normalize category from event data (handles JSON arrays)
function normalizeCategory(category?: string): string {
    if (!category) return '';

    // Try to parse if it's JSON
    try {
        const parsed = JSON.parse(category);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0]; // Return first category
        }
    } catch (e) {
        // Not JSON, return as-is
    }

    return category;
}

// Helper to check if event matches party category filter
function matchesPartyCategory(event: AnalyticsEvent, categoryId: string): boolean {
    if (categoryId === 'All') return true;

    const partyConfig = PARTY_CATEGORIES.find(c => c.id === categoryId);
    if (!partyConfig) return false;

    const parties = event.politicalParties || [];
    return parties.some(party =>
        partyConfig.keywords.some(keyword =>
            party.toLowerCase().includes(keyword.toLowerCase())
        )
    );
}

export default function AnalyticsMap({ events, startDate, endDate, onDateChange }: AnalyticsMapProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('All')
    const [selectedPartyCategory, setSelectedPartyCategory] = useState<string>('All')
    const [selectedEvents, setSelectedEvents] = useState<AnalyticsEvent[]>([])
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Filter out "Non-Violence" and only use 6 violence categories
    const violenceCategories = VIOLENCE_CATEGORIES.filter(c => c !== 'Non-Violence');

    // Filter events
    const filteredEvents = events.filter(e => {
        if (!e.latitude || !e.longitude) return false;

        // Category filter
        if (selectedCategory !== 'All') {
            const normalizedCategory = normalizeCategory(e.category);
            if (normalizedCategory !== selectedCategory) return false;
        }

        // Party category filter
        if (!matchesPartyCategory(e, selectedPartyCategory)) return false;

        return true;
    });

    // Group events by location
    const groupedEvents = filteredEvents.reduce((acc, event) => {
        if (!event.latitude || !event.longitude) return acc
        const key = `${event.latitude.toFixed(3)},${event.longitude.toFixed(3)}`
        if (!acc[key]) acc[key] = []
        acc[key].push(event)
        return acc
    }, {} as Record<string, AnalyticsEvent[]>)

    const handleMarkerClick = (eventOrEvents: AnalyticsEvent | AnalyticsEvent[]) => {
        if (Array.isArray(eventOrEvents)) {
            setSelectedEvents(eventOrEvents)
        } else {
            setSelectedEvents([eventOrEvents])
        }
        setSidebarOpen(true)
    }

    return (
        <div className="space-y-4">
            {/* Filter Controls */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Map Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    {/* Violence Category Filter */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Violence Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        >
                            <option value="All">All Categories</option>
                            {violenceCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Party / Actor Filter */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Party / Actor
                        </label>
                        <select
                            value={selectedPartyCategory}
                            onChange={(e) => setSelectedPartyCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        >
                            <option value="All">All Categories</option>
                            {PARTY_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Filter (Duplicated from top) */}
                    <div className="w-full md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date Range
                        </label>
                        <DateRangeFilter
                            startDate={startDate}
                            endDate={endDate}
                            onDateChange={onDateChange}
                        />
                    </div>
                </div>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredEvents.length} of {events.filter(e => e.latitude && e.longitude).length} incidents
                </div>
            </div>

            {/* Map and Sidebar Container */}
            <div className="relative">
                <div className="h-[600px] w-full rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm">
                    <MapContainer
                        bounds={[
                            [20.5, 88.0],
                            [26.7, 92.8]
                        ]}
                        minZoom={6}
                        maxBounds={[
                            [20.0, 87.5],
                            [27.5, 93.5]
                        ]}
                        maxBoundsViscosity={1.0}
                        zoomSnap={0.5}
                        zoomControl={false}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <ZoomControl position="bottomright" />
                        <HeatmapLayer events={filteredEvents} />

                        {Object.entries(groupedEvents).map(([key, group]) => {
                            const [lat, lng] = key.split(',').map(Number)
                            const isCluster = group.length > 1
                            const totalKilled = group.reduce((sum, e) => sum + (e.killed || 0), 0)
                            const totalInjured = group.reduce((sum, e) => sum + (e.injured || 0), 0)
                            const markerColor = getMarkerColor(totalKilled, totalInjured)

                            return (
                                <CircleMarker
                                    key={key}
                                    center={[lat, lng]}
                                    radius={isCluster ? 10 : 7}
                                    pathOptions={{
                                        fillColor: markerColor,
                                        fillOpacity: 0.7,
                                        color: isCluster ? '#fff' : markerColor,
                                        weight: isCluster ? 3 : 2
                                    }}
                                    eventHandlers={{
                                        click: () => handleMarkerClick(group)
                                    }}
                                />
                            )
                        })}
                    </MapContainer>
                </div>

                {/* Sidebar */}
                {sidebarOpen && selectedEvents.length > 0 && (
                    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-gray-50 dark:bg-slate-950 border-l border-gray-200 dark:border-slate-800 shadow-2xl z-[1000] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 flex justify-between items-start z-10">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    {selectedEvents.length > 1 ? `Incidents (${selectedEvents.length})` : 'Incident Details'}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {selectedEvents[0].district}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSidebarOpen(false);
                                    setSelectedEvents([]);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {selectedEvents.map((event, index) => (
                                <div key={event.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="p-4 space-y-4">
                                        {/* Title */}
                                        <div>
                                            <h4 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                                                {event.title}
                                            </h4>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tighter">📅 Date:</span>
                                            <span>{formatDate(event.date)}</span>
                                        </div>

                                        {/* Casualties */}
                                        <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">💀</span>
                                                <div>
                                                    <div className="text-lg font-bold text-red-600 dark:text-red-400">{event.killed || 0}</div>
                                                    <div className="text-[10px] uppercase text-gray-500 font-bold">Killed</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">🤕</span>
                                                <div>
                                                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{event.injured || 0}</div>
                                                    <div className="text-[10px] uppercase text-gray-500 font-bold">Injured</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Category & Parties */}
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {event.category && (
                                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-800/50">
                                                    {normalizeCategory(event.category)}
                                                </span>
                                            )}
                                            {event.politicalParties?.map((party, idx) => (
                                                <span key={idx} className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-slate-700">
                                                    {party}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Summary */}
                                        {event.summary && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic line-clamp-4 hover:line-clamp-none transition-all">
                                                "{event.summary}"
                                            </p>
                                        )}

                                        {/* Source Link */}
                                        {event.url && (
                                            <div className="pt-2">
                                                <a
                                                    href={event.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group"
                                                >
                                                    READ FULL REPORT <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`h-1 w-full ${getMarkerColor(event.killed, event.injured) === '#94a3b8' ? 'bg-slate-400' : 'bg-red-600'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
