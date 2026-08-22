'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    BarChart3,
    TrendingUp,
    ShieldAlert,
    Landmark,
    Building2,
    Scale,
    ExternalLink,
    PieChart as PieIcon,
    MapPin,
    AlertCircle,
    Calendar,
    ArrowRight,
    RefreshCw,
    Download
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { formatDate } from '@/lib/utils'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
)

interface StatsData {
    totalIncidents: number
    todayCount: number
    totalLossCrores: string
    largestScam: {
        title: string
        amountFormatted: string
        amountInvolved: number
        url: string
        sectorOrMinistry: string
    } | null
    topSector: { name: string; count: number } | null
    hotspot: { name: string; count: number } | null
    sectorBreakdowns: Array<{ sectorOrMinistry: string; _count: { id: number }; _sum: { amountInvolved: number | null } }>
    categoryBreakdowns: Array<{ category: string; _count: { id: number }; _sum: { amountInvolved: number | null } }>
    agencyBreakdowns: Array<{ investigatingAgency: string; _count: { id: number } }>
    districtBreakdowns: Array<{ district: string; _count: { id: number }; _sum: { amountInvolved: number | null } }>
    statusBreakdowns: Array<{ legalStatus: string; _count: { id: number } }>
    recentEvents: Array<{
        id: string
        title: string
        summary: string | null
        category: string
        sectorOrMinistry: string | null
        amountFormatted: string | null
        investigatingAgency: string | null
        district: string | null
        legalStatus: string | null
        publishedAt: string
        url: string
        source: string | null
    }>
}

export default function StatisticsPage() {
    const { t } = useLanguage()
    const [timeRange, setTimeRange] = useState('all')
    const [stats, setStats] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/stats?timeRange=${timeRange}`)
            const data = await res.json()
            setStats(data)
        } catch (err) {
            console.error('Error fetching statistics:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [timeRange])

    // Category Chart Data
    const categoryChartData = {
        labels: stats?.categoryBreakdowns?.map(c => c.category) || [],
        datasets: [
            {
                label: 'ঘটনার সংখ্যা (Incidents)',
                data: stats?.categoryBreakdowns?.map(c => c._count.id) || [],
                backgroundColor: [
                    '#10b981', // emerald
                    '#f59e0b', // amber
                    '#ef4444', // red
                    '#8b5cf6', // purple
                    '#3b82f6', // blue
                    '#ec4899', // pink
                    '#6b7280', // gray
                ],
                borderWidth: 0,
            }
        ]
    }

    // Sector Chart Data
    const sectorChartData = {
        labels: stats?.sectorBreakdowns?.map(s => s.sectorOrMinistry) || [],
        datasets: [
            {
                label: 'নথিভুক্ত দুর্নীতি (Cases)',
                data: stats?.sectorBreakdowns?.map(s => s._count.id) || [],
                backgroundColor: '#10b981',
                borderRadius: 6,
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    boxWidth: 12,
                    font: { size: 11 },
                    color: '#9ca3af'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(156, 163, 175, 0.1)' },
                ticks: { color: '#9ca3af', font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af', font: { size: 11 } }
            }
        }
    }

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    boxWidth: 12,
                    font: { size: 11 },
                    color: '#9ca3af'
                }
            }
        },
        cutout: '68%'
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
            {/* Top Banner */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                            {t('analytics')} & পরিসংখ্যান (Corruption Analytics)
                        </h1>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        জাতীয় সংবাদপত্র ও অনুসন্ধান থেকে কৃত্রিম বুদ্ধিমত্তা (AI) ও দুদক সূত্রে বিশ্লেষিত সামগ্রিক দুর্নীতি সূচক
                    </p>
                </div>

                {/* Filter and Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 text-xs font-semibold">
                        {[
                            { key: 'all', label: 'সব সময় (All)' },
                            { key: '30d', label: 'গত ৩০ দিন' },
                            { key: '3m', label: 'গত ৩ মাস' },
                            { key: '1y', label: '১ বছর' },
                        ].map(item => (
                            <button
                                key={item.key}
                                onClick={() => setTimeRange(item.key)}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    timeRange === item.key
                                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={fetchStats}
                        title="রিলোড করুন"
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Incidents */}
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">মোট দুর্নীতির ঘটনা</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-3xl font-black text-zinc-900 dark:text-white">
                            {stats?.totalIncidents ?? 0}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                            <span className="text-emerald-500 font-bold">● আজ নথিভুক্ত:</span> {stats?.todayCount ?? 0} টি
                        </p>
                    </div>
                </div>

                {/* Card 2: Total Financial Loss */}
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">মোট আত্মসাৎ / ক্ষতি</span>
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <Landmark className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
                            ৳{stats?.totalLossCrores ?? '0.0'} <span className="text-lg font-bold">কোটি</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            অনুসন্ধান ও মামলার তথ্যানুযায়ী
                        </p>
                    </div>
                </div>

                {/* Card 3: Top Corrupt Sector */}
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">শীর্ষ দুর্নীতির খাত</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Building2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                            {stats?.topSector?.name || 'স্বাস্থ্য / ব্যাংকিং'}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {stats?.topSector?.count ? `${stats.topSector.count} টি ঘটনা চিহ্নিত` : 'সর্বাধিক অভিযোগ'}
                        </p>
                    </div>
                </div>

                {/* Card 4: Top District Hotspot */}
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">হটস্পট জেলা</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <MapPin className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold text-zinc-900 dark:text-white">
                            {stats?.hotspot?.name || 'Dhaka (ঢাকা)'}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {stats?.hotspot?.count ? `${stats.hotspot.count} টি দুর্নীতির ঘটনা` : 'কেন্দ্রীভূত অভিযোগ'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sector Bar Chart (2 columns) */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <div>
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-emerald-500" />
                                খাতভিত্তিক দুর্নীতির পরিসংখ্যান (Sector Breakdown)
                            </h2>
                            <p className="text-xs text-zinc-400">বিভিন্ন মন্ত্রণালয় ও খাতে নথিভুক্ত দুর্নীতির সংখ্যার অনুপাত</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-xs text-zinc-400">লোড হচ্ছে...</div>
                        ) : (
                            <Bar data={sectorChartData} options={chartOptions} />
                        )}
                    </div>
                </div>

                {/* Category Donut Chart (1 column) */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <div>
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <PieIcon className="w-4 h-4 text-emerald-500" />
                                দুর্নীতির ধরন (Crime Types)
                            </h2>
                            <p className="text-xs text-zinc-400">অভিযোগের শ্রেণিবিভাগ</p>
                        </div>
                    </div>
                    <div className="h-72 w-full flex items-center justify-center">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-xs text-zinc-400">লোড হচ্ছে...</div>
                        ) : (
                            <Doughnut data={categoryChartData} options={doughnutOptions} />
                        )}
                    </div>
                </div>
            </div>

            {/* Investigating Agencies & District Hotspots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Investigating Agency Breakdown */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Scale className="w-4 h-4 text-emerald-500" />
                            তদন্ত সংস্থাভিত্তিক কার্যক্রম (Investigating Agencies)
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {stats?.agencyBreakdowns && stats.agencyBreakdowns.length > 0 ? (
                            stats.agencyBreakdowns.map((agency, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{agency.investigatingAgency || 'অন্যান্য'}</span>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                        {agency._count.id} টি অনুসন্ধান
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-zinc-400 text-center py-6">কোনো তথ্য পাওয়া যায়নি</div>
                        )}
                    </div>
                </div>

                {/* District Breakdown List */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500" />
                            শীর্ষ জেলাসমূহ (Top District Hotspots)
                        </h2>
                        <Link
                            href="/map"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                            মানচিত্রে দেখুন <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-2">
                        {stats?.districtBreakdowns && stats.districtBreakdowns.length > 0 ? (
                            stats.districtBreakdowns.slice(0, 5).map((dist, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-950/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-zinc-400 w-4">{i + 1}.</span>
                                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{dist.district}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">{dist._count.id} ঘটনা</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-zinc-400 text-center py-6">কোনো তথ্য পাওয়া যায়নি</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Corruption Cases */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div>
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-emerald-500" />
                            সর্বশেষ নথিভুক্ত দুর্নীতির কেলেঙ্কারি (Latest Investigated Cases)
                        </h2>
                        <p className="text-xs text-zinc-400">এআই বিশ্লেষিত ও যাচাইকৃত সাম্প্রতিক অভিযোগ</p>
                    </div>
                    <Link
                        href="/data"
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                        সম্পূর্ণ ডাটাবেস দেখুন <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats?.recentEvents && stats.recentEvents.length > 0 ? (
                        stats.recentEvents.slice(0, 6).map((event) => (
                            <div
                                key={event.id}
                                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            {event.category}
                                        </span>
                                        <span className="text-[11px] text-zinc-400 font-mono">
                                            {formatDate(event.publishedAt)}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                                        {event.title}
                                    </h3>
                                    {event.summary && (
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                            {event.summary}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800/60 text-xs">
                                    <div className="flex items-center gap-2">
                                        {event.amountFormatted && (
                                            <span className="font-bold text-rose-600 dark:text-rose-400">
                                                {event.amountFormatted}
                                            </span>
                                        )}
                                        {event.sectorOrMinistry && (
                                            <span className="text-zinc-500 dark:text-zinc-400">
                                                • {event.sectorOrMinistry}
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        href={event.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                                    >
                                        <span>{event.source || 'উৎস'}</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center text-xs text-zinc-400 py-8">কোনো ঘটনা পাওয়া যায়নি</div>
                    )}
                </div>
            </div>
        </div>
    )
}
