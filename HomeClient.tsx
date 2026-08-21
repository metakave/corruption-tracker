'use client'

import MapWrapper from '@/components/MapWrapper'
import RecentFeed from '@/components/Dashboard/RecentFeed'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { Radio, BarChart3, Table as TableIcon, Globe, Info, Briefcase, Maximize2 } from 'lucide-react'
import Link from 'next/link'
import SystemStatusWidget from '@/components/Dashboard/SystemStatusWidget'

interface HomeClientProps {
    initialStats: any
}

export default function HomeClient({ initialStats }: HomeClientProps) {
    const { t, language } = useLanguage()
    const [stats, setStats] = useState<any>(initialStats)

    // Re-fetch on mount for real-time updates (SSR data is static cache until revalidate)
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
        <div className="flex flex-col p-4 md:p-6 gap-6 bg-gray-50 dark:bg-black transition-colors">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 shadow-md border-l-4 border-yellow-500 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <h2 className={`text-2xl font-bold text-white mb-2 ${language === 'bn' ? 'font-bengali' : ''}`}>
                        <span className="text-red-400">{t('app_name_violence')}</span> {t('app_name_tracker')}: {t('welcome_title')}
                    </h2>
                    <p className={`text-blue-100 text-lg leading-relaxed max-w-4xl text-justify ${language === 'bn' ? 'font-bengali' : ''}`}>
                        {t('welcome_desc')}
                    </p>
                </div>
            </div>

            {/* Quick Navigation Moved Below System Status */}

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {/* 1. Total Incidents */}
                <a href="/data" className="block group">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between transition-all group-hover:border-blue-300 dark:group-hover:border-blue-700 group-hover:shadow cursor-pointer h-24 md:h-full">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t('total_incidents')}</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalIncidents}</h3>
                            <span className="text-xs text-blue-500 dark:text-blue-400 mt-1 inline-block font-medium">{t('view_archive')}</span>
                        </div>
                        <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">📊</div>
                    </div>
                </a>

                {/* 2. Today's Activity */}
                <a href="/data?timeRange=today" className="block group">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between transition-all group-hover:border-red-300 dark:group-hover:border-red-700 group-hover:shadow cursor-pointer h-24 md:h-full">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{t('today_incidents')}</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.todayCount !== undefined ? stats.todayCount : '-'}</h3>
                            <span className="text-xs text-red-500 dark:text-red-400 mt-1 inline-block font-medium">{t('live_updates')}</span>
                        </div>
                        <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform animate-pulse">🔴</div>
                    </div>
                </a>

                {/* 3. Deadliest Incident (Last 7d) */}
                <a href={stats.deadliest?.url || '#'} target={stats.deadliest ? "_blank" : "_self"} className="block group md:col-span-1">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between transition-all group-hover:border-orange-300 dark:group-hover:border-orange-700 group-hover:shadow cursor-pointer h-24 md:h-full">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{t('deadliest_7days')}</p>
                            {stats.deadliest ? (
                                <>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate" title={stats.deadliest.title}>
                                        {stats.deadliest.killed} {t('killed')}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1 truncate">{stats.deadliest.title}</p>
                                </>
                            ) : (
                                <h3 className="text-lg font-bold text-gray-400 mt-1">{t('none_recorded')}</h3>
                            )}
                        </div>
                        <div className="h-10 w-10 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform ml-2 shrink-0">⚠️</div>
                    </div>
                </a>

                {/* 4. High Risk District */}
                <a href={stats.hotspot?.name ? `/data?district=${stats.hotspot.name}` : '#'} className="block group">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between transition-all group-hover:border-zinc-400 dark:group-hover:border-zinc-600 group-hover:shadow cursor-pointer h-24 md:h-full">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">{t('high_risk_zone')}</p>
                            {stats.hotspot ? (
                                <>
                                    <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mt-1 truncate max-w-[120px]" title={stats.hotspot.name}>{stats.hotspot.name}</h3>
                                    <span className="text-xs text-gray-400 mt-1 inline-block">{stats.hotspot.count} {t('incidents_7d')}</span>
                                </>
                            ) : (
                                <h3 className="text-xl font-bold text-gray-400 mt-1">{t('loading')}</h3>
                            )}
                        </div>
                        <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:scale-110 transition-transform">📍</div>
                    </div>
                </a>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 pb-20 md:pb-10">
                {/* Left Column - Map (Takes up 2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-6 min-h-[400px] h-full min-w-0">

                    {/* Map Section */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[500px] md:flex-1 shrink-0 w-full max-w-full min-h-[500px]">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('live_incident_map')}</h3>
                            <a
                                href="/map"
                                target="_blank"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                title="Open Full Screen Map"
                            >
                                <Maximize2 className="w-5 h-5" />
                            </a>
                        </div>
                        <div className="flex-1 relative min-h-[300px] w-full max-w-full isolate">
                            <MapWrapper />
                        </div>
                    </div>

                    {/* System Status Widget (Moved below map as per request) */}
                    <div className="shrink-0">
                        <SystemStatusWidget />
                    </div>

                    {/* Quick Navigation - Moved Below System Status */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 shrink-0">
                        <Link href="/feed" className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-700 transition-all hover:shadow group text-center">
                            <Radio className="w-5 h-5 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('live_feed')}</span>
                        </Link>
                        <Link href="/analytics" className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow group text-center">
                            <BarChart3 className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('analytics')}</span>
                        </Link>
                        <Link href="/data" className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700 transition-all hover:shadow group text-center">
                            <TableIcon className="w-5 h-5 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('data_table')}</span>
                        </Link>
                        <Link href="/faq" className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow group text-center">
                            <Globe className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('faq')}</span>
                        </Link>
                        <Link href="/about" className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:shadow group text-center">
                            <Info className="w-5 h-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('about')}</span>
                        </Link>
                        <Link href="/business" className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all hover:shadow group text-center">
                            <Briefcase className="w-5 h-5 text-teal-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('business')}</span>
                        </Link>
                    </div>
                </div>

                {/* Right Column - Feed (Takes up 1/3, Full Height) */}
                <div className="flex flex-col h-[600px] md:h-[850px] min-h-0 min-w-0">
                    <RecentFeed />
                </div>
            </div>
        </div>
    )
}
