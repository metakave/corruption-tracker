'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { Landmark, TrendingDown, AlertTriangle, Building2, MapPin, Download, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import MapWrapper from '@/components/MapWrapper'

interface HomeClientProps {
    initialStats: any
}

export default function HomeClient({ initialStats }: HomeClientProps) {
    const { t, language } = useLanguage()
    const [stats, setStats] = useState<any>(initialStats)

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setStats(data)
                }
            })
            .catch(console.error)
    }, [])

    return (
        <div className="flex flex-col p-4 md:p-6 gap-6 bg-gray-50 dark:bg-black transition-colors min-h-screen">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 shadow-lg border border-emerald-800/40 relative overflow-hidden">
                <div className="relative z-10 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {t('ai_engine')}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
                        <span className="text-emerald-400">{t('app_name_corruption')}</span> {t('app_name_tracker')}: {t('welcome_title')}
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                        {t('welcome_desc')}
                    </p>
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Incidents */}
                <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('total_incidents')}</span>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <Landmark className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.totalIncidents || 0}</h2>
                        <Link href="/data" className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium inline-block hover:underline">
                            {t('view_archive')}
                        </Link>
                    </div>
                </div>

                {/* Estimated Financial Loss */}
                <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('total_loss')}</span>
                        <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-lg text-rose-600 dark:text-rose-400">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                            ৳{stats.totalLossCrores || "0.0"} <span className="text-sm font-normal text-zinc-500">{t('crores_bdt')}</span>
                        </h2>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 inline-block">
                            {stats.todayCount || 0} {t('today_incidents')}
                        </span>
                    </div>
                </div>

                {/* Top Affected Sector */}
                <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('top_sector')}</span>
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600 dark:text-amber-400">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                            {stats.topSector?.name || (language === 'bn' ? "স্বাস্থ্য ও প্রশাসন" : "Health & Administration")}
                        </h3>
                        <span className="text-xs text-amber-600 dark:text-amber-400 mt-2 inline-block font-medium">
                            {stats.topSector?.count || 0} {t('reports_count')}
                        </span>
                    </div>
                </div>

                {/* Hotspot District */}
                <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('hotspot_district')}</span>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {stats.hotspot?.name || (language === 'bn' ? "ঢাকা" : "Dhaka")}
                        </h3>
                        <span className="text-xs text-blue-600 dark:text-blue-400 mt-2 inline-block font-medium">
                            {stats.hotspot?.count || 0} {t('under_investigation')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Map and Sector Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm overflow-hidden min-h-[450px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-500" />
                            {t('map')} - {t('map_district_spread')}
                        </h3>
                        <Link
                            href="/map"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                        >
                            {t('view_large_map')}
                        </Link>
                    </div>
                    <div className="h-[400px] rounded-xl overflow-hidden">
                        <MapWrapper />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-indigo-500" />
                            {t('sector_breakdown_title')}
                        </h3>
                        <div className="space-y-3">
                            {(stats.sectorBreakdowns && stats.sectorBreakdowns.length > 0 ? stats.sectorBreakdowns : [
                                { sectorOrMinistry: language === 'bn' ? 'ব্যাংক ও আর্থিক প্রতিষ্ঠান' : 'Banking & Financial Institutions', _count: { id: 18 }, _sum: { amountInvolved: 5200000000 } },
                                { sectorOrMinistry: language === 'bn' ? 'স্বাস্থ্য ও পরিবার কল্যাণ' : 'Health & Family Welfare', _count: { id: 12 }, _sum: { amountInvolved: 850000000 } },
                                { sectorOrMinistry: language === 'bn' ? 'সড়ক, সেতু ও যোগাযোগ' : 'Roads, Bridges & Transport', _count: { id: 9 }, _sum: { amountInvolved: 1400000000 } },
                                { sectorOrMinistry: language === 'bn' ? 'ভূমি ও আবাসন' : 'Land & Housing', _count: { id: 7 }, _sum: { amountInvolved: 430000000 } },
                                { sectorOrMinistry: language === 'bn' ? 'কাস্টমস, এনবিআর ও কর' : 'Customs, NBR & Taxes', _count: { id: 6 }, _sum: { amountInvolved: 920000000 } },
                            ]).map((item: any, idx: number) => (
                                <div key={idx} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.sectorOrMinistry}</p>
                                        <p className="text-xs text-zinc-500">{item._count?.id || item.count} {t('cases_count')}</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                                        ৳{((item._sum?.amountInvolved || 0) / 10000000).toFixed(1)} {t('crores_unit')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <Link href="/data" className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
                            <Download className="w-4 h-4" />
                            {t('view_full_database')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
