'use client'

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, AlertCircle, Clock, Database, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatDate, getNextScrapeTime } from '@/lib/utils';

interface ScraperStats {
    lastRun: {
        timestamp: string;
        status: string;
        duration: number | null;
        articlesFound: number;
        violenceDetected: number;
        runId: string;
    } | null;
    bySource: Record<string, { total: number; violence: number; lastScraped: string | null }>;
    overall: {
        totalArticles: number;
        totalViolence: number;
        firstDataDate: string | null;
        lastUpdate: string | null;
    };
    recentLogs: Array<{
        runId: string;
        startTime: string;
        endTime: string | null;
        status: string;
        totalArticles: number;
        violenceDetected: number;
        sourcesScraped: Record<string, number> | null;
        errors: string[] | null;
    }>;
}

export default function SystemStatusWidget() {
    const { t, language } = useLanguage();
    const [stats, setStats] = useState<ScraperStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const next = getNextScrapeTime();
            const diff = next.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining(language === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const pad = (n: number) => n.toString().padStart(2, '0');
            setTimeRemaining(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [language]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/scraper-stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
            setError(null);
        } catch (err) {
            setError('Failed to load statistics');
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'partial':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            partial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        };
        return colors[status as keyof typeof colors] || colors.running;
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return language === 'bn' ? `${diffDays} দিন আগে` : `${diffDays}d ago`;
        if (diffHours > 0) return language === 'bn' ? `${diffHours} ঘন্টা আগে` : `${diffHours}h ago`;
        if (diffMins > 0) return language === 'bn' ? `${diffMins} মিনিট আগে` : `${diffMins}m ago`;
        return language === 'bn' ? 'এইমাত্র' : 'Just now';
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    if (loading && !stats) return <div className="h-48 flex items-center justify-center"><Activity className="w-6 h-6 text-blue-500 animate-spin" /></div>;
    if (error) return null;
    if (!stats) return null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className={`font-semibold text-gray-900 dark:text-white flex items-center gap-2 ${language === 'bn' ? 'font-bengali' : ''}`}>
                    <Activity className="w-5 h-5 text-blue-500" />
                    {language === 'bn' ? 'সিস্টেম স্ট্যাটাস ও মনিটরিং' : 'System Status & Monitoring'}
                </h3>
                {stats.lastRun && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(stats.lastRun.status)}`}>
                        {stats.lastRun.status.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Data Availability Section */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900/50 mb-4 ">
                <div className="flex items-center gap-2 mb-1">
                    <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <h4 className={`text-xs font-semibold text-gray-900 dark:text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                        {language === 'bn' ? 'ডাটা প্রাপ্যতা' : 'Data Availability'}
                    </h4>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <p className="text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'মনিটর শুরু:' : 'Monitor start from:'} <span className="font-medium text-gray-900 dark:text-gray-200">30 Dec 2025</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'সর্বশেষ আপডেট:' : 'Updated till:'} <span className="font-medium text-gray-900 dark:text-gray-200">
                            {stats.lastRun?.timestamp ? new Date(stats.lastRun.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                            , {stats.lastRun?.timestamp ? new Date(stats.lastRun.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Last Run Info */}
                {stats.lastRun && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-900/30">
                        <h4 className={`text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide ${language === 'bn' ? 'font-bengali' : ''}`}>
                            {language === 'bn' ? 'সর্বশেষ অটোমেশন' : 'Last Automation Check'}
                        </h4>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400 text-xs">{language === 'bn' ? 'সময়' : 'Time'}:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatTimeAgo(stats.lastRun.timestamp)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400 text-xs">{language === 'bn' ? 'স্থিতিকাল' : 'Duration'}:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatDuration(stats.lastRun.duration)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400 text-xs">{language === 'bn' ? 'নতুন নিবন্ধ' : 'New Articles'}:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{stats.lastRun.articlesFound}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Overall Stats */}
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                    <h4 className={`text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide ${language === 'bn' ? 'font-bengali' : ''}`}>
                        {language === 'bn' ? 'ডেটাবেজ ওভারভিউ' : 'Database Overview'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-1 mb-0.5">
                                <Database className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">{language === 'bn' ? 'মোট নিবন্ধ' : 'Total'}</span>
                            </div>
                            <p className="font-bold text-gray-900 dark:text-white">{stats.overall.totalArticles.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-1 mb-0.5">
                                <Shield className="w-3 h-3 text-red-500" />
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">{language === 'bn' ? 'সহিংসতা' : 'Violence'}</span>
                            </div>
                            <p className="font-bold text-red-600 dark:text-red-400">{stats.overall.totalViolence.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Mini Log */}
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                    <h4 className={`text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide ${language === 'bn' ? 'font-bengali' : ''}`}>
                        {language === 'bn' ? 'অ্যাক্টিভিটি লগ' : 'Activity Log'}
                    </h4>
                    <div className="space-y-2 max-h-[80px] overflow-y-auto pr-1 custom-scrollbar">
                        {stats.recentLogs.slice(0, 3).map((log) => (
                            <div key={log.runId} className="flex items-center justify-between text-xs bg-white dark:bg-gray-800 p-1.5 rounded border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-1.5">
                                    {getStatusIcon(log.status)}
                                    <span className="text-gray-600 dark:text-gray-400">{formatTimeAgo(log.startTime)}</span>
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{log.violenceDetected} events</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
