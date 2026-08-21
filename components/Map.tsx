'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import { useLanguage } from '@/context/LanguageContext'
import { formatDate } from '@/lib/utils'

// Heatmap Component
function HeatmapLayer({ events }: { events: Event[] }) {
    const map = useMap()
    // Make sure map invalidates size to fill container
    useEffect(() => {
        setTimeout(() => { map.invalidateSize() }, 100)
    }, [map])


    useEffect(() => {
        if (!map || events.length === 0) return

        // Safety check for map dimensions to prevent IndexSizeError
        const size = map.getSize()
        if (size.x === 0 || size.y === 0) return

        const points = events
            .filter(e => e.latitude && e.longitude)
            .map(e => [
                e.latitude,
                e.longitude,
                (e.severityScore || 1) * 200 // Adjusted intensity
            ]) as L.HeatLatLngTuple[]

        // @ts-ignore - leaflet.heat adds heatLayer to L
        const heat = L.heatLayer(points, {
            radius: 30, // Slightly larger radius
            blur: 20,
            maxZoom: 10,
            max: 1000,
            gradient: {
                0.2: '#fdba74', // Orange-200 (Low density)
                0.4: '#fb923c', // Orange-400
                0.6: '#ef4444', // Red-500
                0.8: '#b91c1c', // Red-700
                1.0: '#7f1d1d'  // Red-900 (High density)
            }
        })

        heat.addTo(map)

        return () => {
            map.removeLayer(heat)
        }
    }, [map, events])

    return null
}

// Fix for default marker icons in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Event {
    id: string;
    title: string;
    url: string;
    publishedAt: string;
    locationText: string | null;
    district: string | null;
    latitude: number | null;
    longitude: number | null;
    politicalParties: string | null;
    actors: string | null;
    summary: string | null;
    injured: number | null;
    killed: number | null;
    affectedInfrastructure: string | null;
    severityScore: number | null;
    confidence: number | null;
    tags: string | null;
    images: string | null;
    dateOfIncident: string | null;
}

/**
 * Get marker color based on severity score (1-5)
 * and recency darkening effect
 */
function getMarkerColor(severity: number | null, daysAgo: number): string {
    const baseColors = [
        '#fecaca', // severity 1: very light red
        '#fca5a5', // severity 2: light red
        '#f87171', // severity 3: medium red
        '#dc2626', // severity 4: dark red
        '#991b1b', // severity 5: very dark red
    ]

    const severityIndex = Math.min(Math.max((severity || 1) - 1, 0), 4)
    let baseColor = baseColors[severityIndex]

    // Darken based on recency (older = darker)
    // Articles within 24h: 100% intensity
    // Articles 30 days old: 20% intensity  
    const intensityFactor = Math.max(0.3, 1 - (daysAgo / 30))

    // For simplicity, if very old (7+ days), make it darker
    if (daysAgo > 7) {
        return '#450a0a' // very dark red/black
    }

    return baseColor
}

export default function Map() {
    const { t } = useLanguage()
    const [events, setEvents] = useState<Event[]>([])
    const [isFullScreen, setIsFullScreen] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsFullScreen(window.location.pathname === '/map')
        }
    }, [])

    useEffect(() => {
        // Calculate 7 days ago
        const date = new Date()
        date.setDate(date.getDate() - 7)
        const startDate = date.toISOString().split('T')[0]

        fetch(`/api/events?startDate=${startDate}&limit=500`)
            .then(res => res.json())
            .then(json => {
                const data = json.data || json
                if (Array.isArray(data)) {
                    setEvents(data)
                }
            })
            .catch(console.error)
    }, [])

    // Group events by location
    const groupedEvents = events.reduce((acc, event) => {
        if (!event.latitude || !event.longitude) return acc
        const key = `${event.latitude.toFixed(4)},${event.longitude.toFixed(4)}`
        if (!acc[key]) acc[key] = []
        acc[key].push(event)
        return acc
    }, {} as Record<string, Event[]>)

    return (
        <div className="h-full w-full z-0">
            <MapContainer
                bounds={[
                    [20.5, 88.0], // Southwest (slightly padded)
                    [26.7, 92.8]  // Northeast (slightly padded)
                ]}
                minZoom={6}
                maxBounds={[
                    [20.0, 87.5], // Stricter South-West
                    [27.5, 93.5]  // Stricter North-East
                ]}
                maxBoundsViscosity={1.0} // Hard stop (no elastic bounce)
                zoomSnap={0.5} // Allow fractional zoom for tighter fit (e.g. 6.5 instead of 6)
                zoomControl={false} // Disable default top-left zoom control
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ZoomControl position="bottomright" />

                <HeatmapLayer events={events} />

                {Object.entries(groupedEvents).map(([key, group]) => {
                    const [lat, lng] = key.split(',').map(Number)
                    const isCluster = group.length > 1

                    // Use the most severe event to determine color
                    const worstEvent = group.reduce((prev, curr) => (curr.severityScore || 0) > (prev.severityScore || 0) ? curr : prev, group[0])

                    // Calculate days ago for worst event (prefer incident date)
                    const displayDate = new Date(worstEvent.dateOfIncident || worstEvent.publishedAt)
                    const now = new Date()
                    const daysAgo = (now.getTime() - displayDate.getTime()) / (1000 * 60 * 60 * 24)
                    const markerColor = getMarkerColor(worstEvent.severityScore, daysAgo)

                    return (
                        <CircleMarker
                            key={key}
                            center={[lat, lng]}
                            radius={isCluster ? 7 : 4} // Smaller circles
                            pathOptions={{
                                fillColor: markerColor,
                                fillOpacity: 0.5,
                                color: markerColor,
                                weight: 1
                            }}
                        >
                            <Popup
                                maxWidth={300}
                                minWidth={250}
                                maxHeight={250}
                                autoPanPadding={[40, 40]} // Keep popup away from edges
                            >
                                <div className="text-sm">
                                    {isCluster ? (
                                        <>
                                            <h3 className="font-bold text-base mb-2 border-b pb-1 border-gray-200 text-gray-900">
                                                {group.length} {t('map_popup_district_title')}
                                            </h3>
                                            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                                                {group.map((event, idx) => (
                                                    <div key={event.id} className="border-b last:border-0 pb-3 border-gray-100">
                                                        <h4 className="font-semibold text-sm mb-1 text-gray-900">
                                                            {idx + 1}. {event.title}
                                                        </h4>
                                                        <div className="flex gap-3 text-xs mb-1">
                                                            <span className="text-red-600 font-bold">💀 {event.killed || 0}</span>
                                                            <span className="text-orange-600 font-bold">🤕 {event.injured || 0}</span>
                                                            <span className="text-gray-500">{new Date(event.dateOfIncident || event.publishedAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {event.summary && (
                                                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">{event.summary}</p>
                                                        )}
                                                        <a href={event.url} target="_blank" className="text-blue-600 hover:underline text-xs">Read Report</a>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <SingleEventContent event={group[0]} />
                                    )}
                                </div>
                            </Popup>
                        </CircleMarker>
                    )
                })}
            </MapContainer>
        </div>
    )
}

function SingleEventContent({ event }: { event: Event }) {
    // Parse JSON fields
    let parties: string[] = []
    try {
        if (event.politicalParties) parties = JSON.parse(event.politicalParties)
    } catch (e) { }

    // Confidence Logic (Adaptive)
    let rawConfidence = event.confidence || 0
    let confidence = 0
    if (rawConfidence <= 1) confidence = Math.round(rawConfidence * 100)
    else if (rawConfidence <= 10) confidence = Math.round(rawConfidence * 10)
    else confidence = Math.round(rawConfidence)
    if (confidence > 100) confidence = 100

    return (
        <div className="space-y-2 text-gray-900">
            <h3 className="font-bold text-base mb-2 text-gray-900">{event.title}</h3>
            <div>
                <span className="font-semibold">📍 Location:</span> {event.locationText || event.district || 'Unknown'}
            </div>
            <div>
                <span className="font-semibold">📅 Date:</span> {formatDate(event.dateOfIncident || event.publishedAt)}
            </div>

            {parties.length > 0 && (
                <div>
                    <span className="font-semibold">🏛️ Parties:</span> {parties.join(', ')}
                </div>
            )}

            {event.summary && (
                <div className="text-gray-700 italic border-l-2 border-gray-300 pl-2">
                    {event.summary}
                </div>
            )}

            <div className="flex gap-3 font-semibold">
                <span className="text-red-600">💀 {event.killed || 0} killed</span>
                <span className="text-orange-600">🤕 {event.injured || 0} injured</span>
            </div>

            {event.affectedInfrastructure && (
                <div>
                    <span className="font-semibold">🏗️ Infrastructure:</span> {event.affectedInfrastructure}
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t">
                <span>Severity: {event.severityScore || 1}/5</span>
                <span>Confidence: {confidence}%</span>
            </div>

            <div className="mt-2 text-right">
                <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                >
                    Read Full Article →
                </a>
            </div>
        </div>
    )
}
