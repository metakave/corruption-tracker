'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Download,
    Calendar,
    AlertTriangle,
    FileText,
    StickyNote,
    ArrowRight
} from 'lucide-react';
import DashboardCards from '../admin/analysis/components/DashboardCards';
import AnalysisCharts from '../admin/analysis/components/AnalysisCharts';
import DrillDownModal from '../admin/analysis/components/DrillDownModal';
import { getEventBuckets, formatDateUI } from '../admin/analysis/utils';
import { useLanguage } from '@/context/LanguageContext';
import DateRangeFilter from '../admin/analysis/components/DateRangeFilter';
import dynamic from 'next/dynamic';

const AnalyticsMap = dynamic(() => import('@/components/AnalyticsMap'), { ssr: false });

export interface AnalysisEvent {
    id: string;
    date: string;
    title: string;
    summary: string;
    district: string;
    killed: number;
    injured: number;
    isPolitical: boolean;
    politicalParties: string[];
    victimParties?: string[];
    perpetratorParties?: string[];
    url: string;
    source?: string;
    additionalSources?: string;
    category?: string;
    tags?: string;
    latitude?: number;
    longitude?: number;
}

export default function AnalyticsPage() {
    const { t } = useLanguage();
    const [events, setEvents] = useState<AnalysisEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Date State (Default to current month)
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        const formatDateStr = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };
        const firstDay = formatDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
        const today = formatDateStr(now);
        return { start: firstDay, end: today };
    });

    const fetchAnalysisData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/analytics/archive?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            const data = await res.json();
            setEvents(data.events || []);
        } catch (e) {
            console.error("Failed to load archive data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchAnalysisData();
    }, [dateRange]); // Fetch on date change

    // Derived Stats
    const stats = React.useMemo(() => {
        const s = {
            total: events.length,
            killed: events.reduce((acc, e) => acc + (e.killed || 0), 0),
            injured: events.reduce((acc, e) => acc + (e.injured || 0), 0),
            political: 0,
            mob: 0,
            communal: 0,
            gender: 0,
            criminal: 0,
            terrorism: 0
        };

        events.forEach(e => {
            const buckets = getEventBuckets(e);
            buckets.forEach(bucket => {
                if (s[bucket] !== undefined) {
                    s[bucket]++;
                }
            });
        });

        return s;
    }, [events]);

    // Helper to avoid hydration errors - MUST be after all hooks
    if (!mounted) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white border-l-4 border-red-600 pl-4 mb-2">
                        Violence Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 pl-4 flex items-center gap-2">
                        <Calendar size={16} />
                        {formatDateUI(dateRange.start)} - {formatDateUI(dateRange.end)}
                    </p>
                </div>

                {/* Date Filter */}
                <div className="flex gap-3 items-center bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800">
                    <DateRangeFilter
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onDateChange={(start, end) => setDateRange({ start, end })}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <DashboardCards
                        stats={stats}
                        onCardClick={(metric) => setSelectedMetric(metric)}
                    />

                    {/* Charts */}
                    <AnalysisCharts
                        events={events}
                        onDistrictClick={(district) => {
                            setSelectedMetric(`district:${district}`);
                        }}
                        onCategoryClick={(category) => setSelectedMetric(category)}
                    />
                </div>
            )}

            {/* Geographical Heatmap Section */}
            {!loading && mounted && (
                <div className="mt-20 pt-16 border-t border-gray-200 dark:border-slate-800">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                            MAP ANALYSIS
                        </h1>
                        <div className="flex justify-center items-center gap-4">
                            <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest text-sm">
                                Geographical Distribution
                            </p>
                            <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
                        </div>
                    </div>

                    <AnalyticsMap
                        events={events}
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onDateChange={(start, end) => setDateRange({ start, end })}
                    />
                </div>
            )}

            {/* Reports Section */}
            <div className="mt-16 border-t border-gray-200 dark:border-slate-800 pt-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-8 bg-red-600 rounded-full"></span>
                    {t('reports_section_title')}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Full Report Card */}
                    <Link href="/insights/january-2026/full" className="group block h-full">
                        <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden p-8">
                                <div className="relative w-full h-full">
                                    <Image
                                        src="/images/logo-bn.png"
                                        alt="Report Logo"
                                        fill
                                        className="object-contain opacity-80 group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </div>
                            <div className="p-6 relative">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                        Full Report
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Jan 2026</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                    {t('jan_2026_full_title')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {t('jan_2026_full_desc')}
                                </p>
                                <span className="inline-flex items-center text-sm font-medium text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform">
                                    {t('read_report')} <ArrowRight className="w-4 h-4 ml-1" />
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Summary Report Card */}
                    <Link href="/insights/january-2026/summary" className="group block h-full">
                        <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden p-8">
                                <div className="relative w-full h-full">
                                    <Image
                                        src="/images/logo-bn.png"
                                        alt="Report Logo"
                                        fill
                                        className="object-contain opacity-80 group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </div>
                            <div className="p-6 relative">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                        Summary
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Jan 2026</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {t('jan_2026_summary_title')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {t('jan_2026_summary_desc')}
                                </p>
                                <span className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                                    {t('read_report')} <ArrowRight className="w-4 h-4 ml-1" />
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Drill Down Modal */}
            {selectedMetric && (
                <DrillDownModal
                    onClose={() => setSelectedMetric(null)}
                    metric={selectedMetric}
                    events={events}
                    readOnly={true} // Hide edit actions for public view
                />
            )}
        </div>
    );
}
