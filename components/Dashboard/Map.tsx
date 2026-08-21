'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'

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
    const [events, setEvents] = useState<Event[]>([])

    useEffect(() => {
        fetch('/api/events')
            .then(res => res.json())
            .then(json => {
                const data = json.data || json
                if (Array.isArray(data)) {
                    setEvents(data)
                }
            })
            .catch(console.error)
    }, [])

    return (
        <div className="h-full w-full z-0">
            <MapContainer
                center={[23.6850, 90.3563]}
                zoom={7}
                minZoom={7} // Restrict zoom out
                maxBounds={[
                    [20.34, 88.01], // Southwest coordinates (approx)
                    [26.64, 92.68]  // Northeast coordinates (approx)
                ]}
                maxBoundsViscosity={1.0} // Sticky bounds
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {events.map(event => {
                    if (!event.latitude || !event.longitude) return null;

                    // Calculate days ago
                    const publishDate = new Date(event.publishedAt)
                    const now = new Date()
                    const daysAgo = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)

                    const markerColor = getMarkerColor(event.severityScore, daysAgo)

                    // Parse JSON fields
                    let parties: string[] = []
                    let tags: string[] = []
                    try {
                        if (event.politicalParties) parties = JSON.parse(event.politicalParties)
                        if (event.tags) tags = JSON.parse(event.tags)
                    } catch (e) { }

                    return (
                        <Circle
                            key={event.id}
                            center={[event.latitude, event.longitude]}
                            radius={5000}
                            pathOptions={{
                                fillColor: markerColor,
                                fillOpacity: 0.8,
                                color: markerColor,
                                weight: 2
                            }}
                        >
                            <Popup maxWidth={400}>
                                <div className="text-sm">
                                    <h3 className="font-bold text-base mb-2">{event.title}</h3>

                                    <div className="space-y-2">
                                        <div>
                                            <span className="font-semibold">📍 Location:</span> {event.locationText || event.district || 'Unknown'}
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

                                        {event.actors && (
                                            <div>
                                                <span className="font-semibold">👥 Actors:</span> {event.actors}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t">
                                            <span>Severity: {event.severityScore || 1}/5</span>
                                            <span>Confidence: {((event.confidence || 0) * 100).toFixed(0)}%</span>
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
                                </div>
                            </Popup>
                        </Circle>
                    )
                })}
            </MapContainer>
        </div>
    )
}
