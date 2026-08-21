'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { DataTable } from '@/components/data-table'
import { TableFilters } from '@/components/table-filters'
import { ColumnDef } from '@tanstack/react-table'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { BD_DISTRICTS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

type PoliticalEvent = {
    id: string
    title: string
    dateOfIncident: string | null
    publishedAt: string
    district: string | null
    incident_type: string
    killed: number
    injured: number
    severityScore: number
    url: string
    tags: string
    politicalParties: string | null
    additionalSources: string | null
    source: string | null
}

function DataContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // Initialize from URL
    const initialFilters = {
        search: searchParams.get('search') || '',
        district: searchParams.get('district') || 'All',
        type: searchParams.get('type') || 'All',
        minSeverity: searchParams.get('minSeverity') || '',
        timeRange: searchParams.get('timeRange') || 'all', // Note: we're doing local mapping for logic
        partyCategory: searchParams.get('partyCategory') || 'All',
        source: searchParams.get('source') || 'All'
    }

    const [data, setData] = useState<PoliticalEvent[]>([])
    const [loading, setLoading] = useState(true)

    // Pagination State
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    // Filters State
    const [filters, setFilters] = useState(initialFilters)

    // Sync URL -> State (When Navbar search pushes new URL)
    useEffect(() => {
        const newSearch = searchParams.get('search') || ''
        if (newSearch !== filters.search) {
            setFilters(prev => ({ ...prev, search: newSearch }))
        }
    }, [searchParams])

    // Sync State -> URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams)

        // Update params based on filters
        if (filters.search) params.set('search', filters.search)
        else params.delete('search')

        if (filters.district !== 'All') params.set('district', filters.district)
        else params.delete('district')

        if (filters.type !== 'All') params.set('type', filters.type)
        else params.delete('type')

        if (filters.partyCategory !== 'All') params.set('partyCategory', filters.partyCategory)
        else params.delete('partyCategory')

        if (filters.source !== 'All') params.set('source', filters.source)
        else params.delete('source')

        if (filters.minSeverity) params.set('minSeverity', filters.minSeverity)
        else params.delete('minSeverity')

        if (filters.timeRange !== 'all') params.set('timeRange', filters.timeRange)
        else params.delete('timeRange')

        params.set('page', page.toString())

        // Replace URL without reloading
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [filters, page])


    // Fetch Data
    const fetchData = async () => {
        setLoading(true)
        try {
            // Calculate Date Range
            let start = null
            let end = null
            const now = new Date()

            if (filters.timeRange !== 'all') {
                if (filters.timeRange === 'today') {
                    start = new Date(now.setHours(0, 0, 0, 0))
                } else if (filters.timeRange === 'yesterday') {
                    start = new Date(now.setDate(now.getDate() - 1))
                    start.setHours(0, 0, 0, 0)
                    end = new Date(now)
                    end.setHours(23, 59, 59, 999)
                } else {
                    const daysMap: Record<string, number> = {
                        '7d': 7, '30d': 30, '3m': 90, '6m': 180, '1y': 365
                    }
                    if (daysMap[filters.timeRange]) {
                        start = new Date(Date.now() - daysMap[filters.timeRange] * 24 * 60 * 60 * 1000)
                    }
                }
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...filters
            })

            // Add date params
            if (start) params.append('startDate', start.toISOString())
            if (end) params.append('endDate', end.toISOString())

            // Remove empty filters
            if (filters.district === 'All') params.delete('district')
            if (filters.type === 'All') params.delete('type')
            if (filters.partyCategory === 'All') params.delete('partyCategory')
            if (filters.source === 'All') params.delete('source')
            if (!filters.search) params.delete('search')
            if (!filters.minSeverity) params.delete('minSeverity')
            params.delete('timeRange') // Don't send this raw param to API

            const res = await fetch(`/api/events?${params}`)
            const json = await res.json()

            if (json.data && Array.isArray(json.data)) {
                setData(json.data)
                setTotalPages(json.metadata?.totalPages || 1)
                setTotalItems(json.metadata?.total || 0)
            } else {
                setData([])
                setTotalPages(1)
                setTotalItems(0)
            }
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchData()
        }, 300)
        return () => clearTimeout(debounce)
    }, [page, filters]) // Re-fetch on filter/page change


    // Columns Definition
    const columns: ColumnDef<PoliticalEvent>[] = [
        {
            accessorKey: 'dateOfIncident',
            header: 'Incident Date',
            cell: ({ row }) => {
                const dateAt = (row.original.dateOfIncident || row.original.publishedAt) as string
                return <span className="text-gray-900 dark:text-gray-100 font-medium text-xs whitespace-nowrap">{formatDate(dateAt)}</span>
            }
        },
        {
            accessorKey: 'severityScore',
            header: 'Sev',
            cell: ({ row }) => {
                const score = row.getValue('severityScore') as number
                let color = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                if (score >= 7) color = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800'
                else if (score >= 4) color = 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-800'

                return (
                    <span className={`px-2 py-0.5 rounded text-xs border border-transparent ${color}`}>
                        {score}
                    </span>
                )
            }
        },
        {
            accessorKey: 'title',
            header: 'Incident',
            cell: ({ row }) => (
                <div className="max-w-md">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm" title={row.original.title}>
                        {row.original.title}
                    </p>
                    <div className="flex gap-2 mt-1">
                        {/* Tags rendering from JSON string if needed, currently just simple text */}
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'district',
            header: 'Location',
            cell: ({ row }) => (
                <span className="text-gray-600 dark:text-gray-300 text-sm">{row.getValue('district') || 'N/A'}</span>
            )
        },
        {
            accessorKey: 'casualties',
            header: 'Casualties',
            cell: ({ row }) => {
                const k = row.original.killed
                const i = row.original.injured
                if (k === 0 && i === 0) return <span className="text-gray-400 dark:text-gray-600 text-xs">-</span>
                return (
                    <div className="flex flex-col gap-1">
                        {k > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 w-fit whitespace-nowrap border border-red-200 dark:border-red-800/50">
                                {k} Killed
                            </span>
                        )}
                        {i > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 w-fit whitespace-nowrap border border-amber-200 dark:border-amber-800/50">
                                {i} Injured
                            </span>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: 'politicalParties',
            header: 'Involved Actors',
            cell: ({ row }) => {
                let parties: string[] = []
                try {
                    const raw = row.getValue('politicalParties') as string
                    if (raw) parties = JSON.parse(raw)
                    if (!Array.isArray(parties)) parties = [raw]
                } catch (e) {
                    parties = [row.getValue('politicalParties') as string]
                }

                return (
                    <div className="flex flex-col gap-1">
                        {parties.slice(0, 3).map((p, idx) => {
                            if (!p) return null
                            let role = 'neutral'
                            let text = p

                            // Naive role parsing
                            const lowerP = p.toLowerCase()

                            // Explicit generic terms regex (Including Plurals)
                            // We list longer (plural) matches first to ensure greedy matching
                            const culpritRegex = /[\(\[]?(miscreants|assailants|attackers|aggressors|culprits|terrorists|দুর্বৃত্তরা|সন্ত্রাসীরা|হামলাকারীরা|miscreant|assailant|attacker|aggressor|culprit|terrorist|দুর্বৃত্ত|সন্ত্রাসী|হামলাকারী|terror)[\)\]]?/gi
                            const victimRegex = /[\(\[]?(victims|attacked|injured|আহতরা|নিহতরা|victim|আহত|নিহত)[\)\]]?/gi

                            // Check for Culprit / Aggressor keywords (English + Bengali)
                            if (
                                lowerP.includes('culprit') || lowerP.includes('assailant') || lowerP.includes('attacker') ||
                                lowerP.includes('aggressor') || lowerP.includes('miscreant') || lowerP.includes('terrorist') ||
                                lowerP.includes('দুর্বৃত্ত') || lowerP.includes('সন্ত্রাসী') || lowerP.includes('হামলাকারী')
                            ) {
                                role = 'culprit'
                                // Remove role tags/words to leave just the actor name (if any)
                                text = p.replace(culpritRegex, '').trim()

                                // Extra cleanup for lingering suffixes
                                const cleanLower = text.toLowerCase()
                                if (cleanLower === 'রা' || cleanLower === 's' || cleanLower === 'ra' || cleanLower === 'der' || cleanLower === 'দের') text = ''
                            }
                            // Check for Victim keywords
                            else if (
                                lowerP.includes('victim') || lowerP.includes('attacked') || lowerP.includes('injured') ||
                                lowerP.includes('আহত') || lowerP.includes('নিহত')
                            ) {
                                role = 'victim'
                                text = p.replace(victimRegex, '').trim()
                                // Extra cleanup
                                const cleanLower = text.toLowerCase()
                                if (cleanLower === 'রা' || cleanLower === 's' || cleanLower === 'ra' || cleanLower === 'der' || cleanLower === 'দের') text = ''
                            }

                            // Clean up punctuation (Avoid \W because it strips Bengali)
                            // Remove common wrapper chars: ( ) [ ] . , -
                            text = text.replace(/^[ \(\)\[\]\.,-]+|[ \(\)\[\]\.,-]+$/g, '')
                            text = text.trim()

                            // If text becomes empty (e.g. input was just "Victim" or "Durbittora"), revert to a descriptive label
                            if (!text) {
                                if (role === 'culprit') text = 'Unidentified Criminals'
                                if (role === 'victim') text = 'Unidentified Victim'
                                if (role === 'neutral') text = p // Fallback
                            }

                            // Style based on role
                            let badgeClass = "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            if (role === 'victim') badgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-500 dark:border-amber-800/50"
                            if (role === 'culprit') badgeClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50"

                            // Don't show (victim) suffix if the text already contains the role name (e.g. Unidentified Victim)
                            // or if role is neutral
                            const showSuffix = role !== 'neutral' && !text.toLowerCase().includes(role)

                            return (
                                <span key={idx} className={`text-[10px] px-1.5 py-0.5 rounded border w-fit max-w-[150px] truncate ${badgeClass}`} title={p}>
                                    {text}
                                    {showSuffix && <span className="opacity-60 ml-1 text-[9px] uppercase tracking-tighter">({role})</span>}
                                </span>
                            )
                        })}
                    </div>
                )
            }
        },
        {
            id: 'actions',
            header: 'Sources',
            cell: ({ row }) => {
                const primaryUrl = row.original.url
                const primarySource = row.original.source || 'News'
                let extraSources: any[] = []

                if (row.original.additionalSources) {
                    try {
                        const raw = JSON.parse(row.original.additionalSources)
                        // Client-side dedup to be safe
                        extraSources = raw.filter((s: any, index: number, self: any[]) =>
                            index === self.findIndex((t: any) => t.url === s.url) && s.url !== primaryUrl
                        )
                    } catch (e) { }
                }

                return (
                    <div className="flex flex-col gap-2 min-w-[100px]">
                        <Link
                            href={primaryUrl}
                            target="_blank"
                            className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300 rounded text-xs transition-colors border border-blue-200 dark:border-blue-800/30 w-fit font-medium"
                            title={`Read on ${primarySource}`}
                        >
                            <span>{primarySource}</span>
                            <ExternalLink className="h-3 w-3" />
                        </Link>

                        {/* Additional Sources */}
                        {extraSources.length > 0 && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 font-medium">Also reported by:</span>
                                <div className="flex flex-wrap gap-1">
                                    {extraSources.map((s, idx) => (
                                        <a
                                            key={idx}
                                            href={s.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-500 transition-colors"
                                            title={s.title || s.source}
                                        >
                                            {s.source}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            }
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-4 md:p-8 transition-colors">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Incident Data Archive</h1>
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        ← Back to Dashboard
                    </Link>
                </div>

                <TableFilters
                    filters={filters}
                    setFilters={(f) => { setFilters(f); setPage(1); }} // Reset page on filter change
                    districts={BD_DISTRICTS}
                />

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-white dark:bg-gray-900 rounded animate-pulse border border-gray-200 dark:border-gray-800"></div>
                        ))}
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={data}
                        pagination={{
                            pageIndex: page,
                            pageSize: 20,
                            total: totalItems,
                            totalPages: totalPages,
                            onPageChange: setPage
                        }}
                    />
                )}
            </div>
        </div>
    )
}

export default function DataPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <DataContent />
        </Suspense>
    )
}
