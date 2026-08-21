'use client'

import { useEffect, useState, useRef } from 'react';
import { X, Activity, CheckCircle2, AlertCircle, Clock, TrendingUp, Database, Shield } from 'lucide-react';
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

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    const { t, language } = useLanguage();
    const [stats, setStats] = useState<ScraperStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
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

        updateCountdown(); // Initial call
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
        if (isOpen) {
            fetchStats();
            // Auto-refresh every 30 seconds when panel is open
            const interval = setInterval(fetchStats, 30000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

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

    // Use Portal to escape parent stacking contexts
    const { createPortal } = require('react-dom');

    const content = (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[99999] flex items-start justify-end pt-16 px-4">
            <div
                ref={panelRef}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-md max-h-[80dvh] overflow-hidden flex flex-col animate-in slide-in-from-top-2 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <h3 className={`font-semibold text-gray-900 dark:text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                            {language === 'bn' ? 'সিস্টেম স্ট্যাটাস' : 'System Status'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
                    {loading && !stats ? (
                        <div className="flex items-center justify-center py-8">
                            <Activity className="w-6 h-6 text-blue-500 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">{error}</p>
                        </div>
                    ) : stats ? (
                        <>
                            {/* Data Availability Section */}
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 border border-emerald-100 dark:border-emerald-900/50 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <h4 className={`text-sm font-semibold text-gray-900 dark:text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                                        {language === 'bn' ? 'ডাটা প্রাপ্যতা' : 'Data Availability'}
                                    </h4>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {language === 'bn' ? 'মনিটর শুরু:' : 'Monitor start from:'} <span className="font-medium text-gray-900 dark:text-gray-200">30 Dec 2025</span>
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {language === 'bn' ? 'সর্বশেষ আপডেট:' : 'Updated till:'} <span className="font-medium text-gray-900 dark:text-gray-200">
                                            {stats.lastRun?.timestamp ? new Date(stats.lastRun.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                                            , {stats.lastRun?.timestamp ? new Date(stats.lastRun.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {language === 'bn' ? 'পরবর্তী আপডেট:' : 'Next Update:'} <span className="font-medium text-blue-600 dark:text-blue-400 tabular-nums animate-pulse">
                                            {timeRemaining}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Last Run Section */}
                            {stats.lastRun && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className={`text-sm font-semibold text-gray-900 dark:text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                                            {language === 'bn' ? 'সর্বশেষ স্ক্র্যাপ' : 'Last Scrape'}
                                        </h4>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(stats.lastRun.status)}`}>
                                            {stats.lastRun.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {language === 'bn' ? 'সময়' : 'Time'}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatTimeAgo(stats.lastRun.timestamp)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {language === 'bn' ? 'সময়কাল' : 'Duration'}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatDuration(stats.lastRun.duration)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {language === 'bn' ? 'প্রাপ্ত নিবন্ধ' : 'Articles Found'}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {stats.lastRun.articlesFound}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {language === 'bn' ? 'সহিংসতা শনাক্ত' : 'Violence Detected'}
                                            </span>
                                            <span className="font-bold text-red-600 dark:text-red-400">
                                                {stats.lastRun.violenceDetected}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Overall Statistics */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
                                <h4 className={`text-sm font-semibold text-gray-900 dark:text-white mb-3 ${language === 'bn' ? 'font-bengali' : ''}`}>
                                    {language === 'bn' ? 'সামগ্রিক পরিসংখ্যান' : 'Overall Statistics'}
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Database className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {language === 'bn' ? 'মোট নিবন্ধ' : 'Total Articles'}
                                            </span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {stats.overall.totalArticles.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield className="w-4 h-4 text-red-500" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {language === 'bn' ? 'সহিংসতা' : 'Violence'}
                                            </span>
                                        </div>
                                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                            {stats.overall.totalViolence.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {stats.overall.firstDataDate && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                                        {language === 'bn' ? 'ডেটা সংরক্ষণ শুরু: ' : 'Data from: '}
                                        {formatDate(stats.overall.firstDataDate)}
                                    </p>
                                )}
                            </div>



                            {/* Recent Activity Log */}
                            {stats.recentLogs.length > 0 && (
                                <div>
                                    <h4 className={`text-sm font-semibold text-gray-900 dark:text-white mb-2 ${language === 'bn' ? 'font-bengali' : ''}`}>
                                        {language === 'bn' ? 'সাম্প্রতিক কার্যকলাপ' : 'Recent Activity'}
                                    </h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {stats.recentLogs.map((log) => (
                                            <div
                                                key={log.runId}
                                                className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(log.status)}
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatTimeAgo(log.startTime)}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(log.status)}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {log.totalArticles} {language === 'bn' ? 'নিবন্ধ' : 'articles'} • {log.violenceDetected} {language === 'bn' ? 'ঘটনা' : 'incidents'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {language === 'bn' ? 'কোন ডেটা নেই' : 'No data available'}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                            {language === 'bn' ? 'AI ইঞ্জিন 1.0' : 'AI Engine 1.0'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {language === 'bn' ? '৫ টি উৎস' : '5 Sources'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
