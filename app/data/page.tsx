'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { DataTable } from '@/components/data-table'
import { TableFilters } from '@/components/table-filters'
import { ColumnDef } from '@tanstack/react-table'

import Link from 'next/link'
import { ExternalLink, ShieldAlert, Building2, User, Landmark, Scale } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { BD_DISTRICTS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

export type CorruptionEvent = {
    id: string
    title: string
    summary: string | null
    dateOfIncident: string | null
    publishedAt: string
    district: string | null
    locationText: string | null
    category: string
    sectorOrMinistry: string | null
    amountInvolved: number | null
    amountFormatted: string | null
    accusedEntities: string | null
    investigatingAgency: string | null
    legalStatus: string | null
    severityScore: number
    url: string
    tags: string | null
    additionalSources: string | null
    source: string | null
}

function DataContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const { t } = useLanguage()

    // Initialize from URL
    const initialFilters = {
        search: searchParams.get('search') || '',
        district: searchParams.get('district') || 'All',
        category: searchParams.get('category') || searchParams.get('type') || 'All',
        sector: searchParams.get('sector') || 'All',
        status: searchParams.get('status') || 'All',
        timeRange: searchParams.get('timeRange') || 'all',
        source: searchParams.get('source') || 'All'
    }

    const [data, setData] = useState<CorruptionEvent[]>([])
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

        if (filters.search) params.set('search', filters.search)
        else params.delete('search')

        if (filters.district !== 'All') params.set('district', filters.district)
        else params.delete('district')

        if (filters.category !== 'All') params.set('category', filters.category)
        else params.delete('category')

        if (filters.sector !== 'All') params.set('sector', filters.sector)
        else params.delete('sector')

        if (filters.status !== 'All') params.set('status', filters.status)
        else params.delete('status')

        if (filters.source !== 'All') params.set('source', filters.source)
        else params.delete('source')

        if (filters.timeRange !== 'all') params.set('timeRange', filters.timeRange)
        else params.delete('timeRange')

        params.set('page', page.toString())

        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [filters, page])

    // Fetch Data
    const fetchData = async () => {
        setLoading(true)
        try {
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

            if (start) params.append('startDate', start.toISOString())
            if (end) params.append('endDate', end.toISOString())

            if (filters.district === 'All') params.delete('district')
            if (filters.category === 'All') params.delete('category')
            if (filters.sector === 'All') params.delete('sector')
            if (filters.status === 'All') params.delete('status')
            if (filters.source === 'All') params.delete('source')
            if (!filters.search) params.delete('search')
            params.delete('timeRange')

            const res = await fetch(`/api/events?${params}`)
            const json = await res.json()

            const list = json.data || json.events || []
            const total = json.metadata?.total ?? json.total ?? 0
            const pages = json.metadata?.totalPages ?? json.totalPages ?? 1

            setData(Array.isArray(list) ? list : [])
            setTotalPages(pages)
            setTotalItems(total)
        } catch (error) {
            console.error("Error fetching data:", error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchData()
        }, 300)
        return () => clearTimeout(debounce)
    }, [page, filters])

    // Columns Definition
    const columns: ColumnDef<CorruptionEvent>[] = [
        {
            accessorKey: 'title',
            header: 'দুর্নীতি ও আর্থিক অনিয়ম (Incident & Summary)',
            cell: ({ row }) => {
                const item = row.original
                const dateAt = item.dateOfIncident || item.publishedAt

                return (
                    <div className="max-w-md space-y-1.5 py-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                                {formatDate(dateAt)}
                            </span>
                            {item.severityScore >= 7 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                                    গুরুতর ({item.severityScore}/10)
                                </span>
                            )}
                        </div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-snug hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                            {item.title}
                        </p>
                        {item.summary && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                {item.summary}
                            </p>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: 'category',
            header: 'ধরন ও খাত (Category & Sector)',
            cell: ({ row }) => {
                const cat = row.original.category || 'Other'
                const sector = row.original.sectorOrMinistry

                let catBadge = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                if (cat === 'Embezzlement' || cat === 'Loan Scam') {
                    catBadge = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                } else if (cat === 'Bribery' || cat === 'Tender Fraud') {
                    catBadge = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                } else if (cat === 'Money Laundering' || cat === 'Illegal Wealth') {
                    catBadge = 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40'
                }

                return (
                    <div className="flex flex-col gap-1.5 min-w-[130px]">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold w-fit ${catBadge}`}>
                            {cat}
                        </span>
                        {sector && (
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                                {sector}
                            </span>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: 'amountFormatted',
            header: 'আত্মসাৎ / আর্থিক ক্ষতি (Loss Amount)',
            cell: ({ row }) => {
                const amtStr = row.original.amountFormatted
                const amtNum = row.original.amountInvolved

                if (!amtStr && !amtNum) {
                    return <span className="text-zinc-400 dark:text-zinc-600 text-xs">তদন্তাধীন</span>
                }

                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-rose-600 dark:text-rose-400">
                            {amtStr || `৳${amtNum?.toLocaleString()}`}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: 'district',
            header: 'ঘটনাস্থল (Location)',
            cell: ({ row }) => (
                <div className="flex flex-col text-xs min-w-[90px]">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {row.original.district || 'অজানা'}
                    </span>
                    {row.original.locationText && (
                        <span className="text-zinc-400 dark:text-zinc-500 truncate max-w-[110px]">
                            {row.original.locationText}
                        </span>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'accusedEntities',
            header: 'অভিযুক্ত ও তদন্ত সংস্থা (Accused & Agency)',
            cell: ({ row }) => {
                let accused: any[] = []
                try {
                    if (row.original.accusedEntities) {
                        accused = JSON.parse(row.original.accusedEntities)
                    }
                } catch {}

                const agency = row.original.investigatingAgency
                const status = row.original.legalStatus

                return (
                    <div className="flex flex-col gap-1 min-w-[140px] max-w-[200px]">
                        {accused.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                                {accused.slice(0, 2).map((a, i) => (
                                    <span key={i} className="text-xs text-zinc-800 dark:text-zinc-200 font-medium truncate" title={`${a.name || ''} - ${a.designation || ''}`}>
                                        👤 {a.name || 'অজ্ঞাত'} {a.designation ? `(${a.designation})` : ''}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-zinc-400 text-xs">-</span>
                        )}

                        {agency && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                <Scale className="w-3 h-3" />
                                {agency}
                            </span>
                        )}
                    </div>
                )
            }
        },
        {
            id: 'actions',
            header: 'উৎস (Source)',
            cell: ({ row }) => {
                const url = row.original.url
                const source = row.original.source || 'নিউজ'

                return (
                    <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-all shadow-sm"
                    >
                        <span>{source}</span>
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                )
            }
        }
    ]

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                        <ShieldAlert className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        {t('data_table')} (দুর্নীতি ও আর্থিক কেলেঙ্কারি তথ্যভাণ্ডার)
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        জাতীয় সংবাদপত্র ও অনুসন্ধান থেকে এআই এবং দুদকের মাধ্যমে সংগৃহীত ও বিশ্লেষিত তথ্য। মোট নথিভুক্ত ঘটনা: <span className="font-bold text-zinc-900 dark:text-white">{totalItems}</span>
                    </p>
                </div>
            </div>

            {/* Filters */}
            <TableFilters
                filters={filters}
                setFilters={setFilters}
                districts={BD_DISTRICTS}
            />

            {/* Table */}
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">তথ্য লোড হচ্ছে...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center p-6">
                    <ShieldAlert className="w-10 h-10 text-zinc-400 mb-2" />
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">কোনো তথ্য পাওয়া যায়নি</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                        বর্তমান ফিল্টারে কোনো দুর্নীতির ঘটনা নথিভুক্ত নেই। ফিল্টার পরিবর্তন বা রিসেট করে পুনরায় অনুসন্ধান করুন।
                    </p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    pagination={{
                        pageIndex: page - 1,
                        pageSize: 20,
                        total: totalItems,
                        totalPages: totalPages,
                        onPageChange: (newPage) => setPage(newPage + 1),
                    }}
                />
            )}
        </div>
    )
}

export default function DataPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8 max-w-7xl flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <DataContent />
        </Suspense>
    )
}
