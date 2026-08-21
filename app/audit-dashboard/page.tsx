
'use client';

import React, { useEffect, useState } from 'react';

interface LogEntry {
    timestamp: string;
    title: string;
    url: string;
    verdict: string;
    reason: string;
    confidence: string;
}

// Robust Helper Functions (Defined outside component to avoid recreation/closures issues)
const safeDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleString();
    } catch (e) {
        return 'Invalid Date';
    }
};

const safeHostname = (urlStr: string) => {
    if (!urlStr || typeof urlStr !== 'string') return 'N/A';
    try {
        // Handle partial URLs or missing protocol if necessary, though logs should have full URLs
        return new URL(urlStr).hostname.replace('www.', '');
    } catch (e) {
        // Fallback: try regex if URL constructor fails
        const match = urlStr.match(/^(?:https?:\/\/)?(?:www\.)?([^/]+)/i);
        return match ? match[1] : 'Invalid URL';
    }
};

export default function AuditDashboardPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // ROBUST URL CONSTRUCTION
            let apiUrl = '/api/admin/logs';
            if (typeof window !== 'undefined') {
                apiUrl = `${window.location.protocol}//${window.location.host}/api/admin/logs`;
            }

            const res = await fetch(apiUrl, {
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                if (res.status === 401) throw new Error('Unauthorized - Please Log In');
                throw new Error(`Failed to fetch logs: ${res.statusText}`);
            }

            const data = await res.json();
            setLogs(data.logs || []);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Clean URL Bar
        if (typeof window !== 'undefined') {
            try {
                const url = new URL(window.location.href);
                if (url.username || url.password) {
                    url.username = '';
                    url.password = '';
                    window.history.replaceState({}, document.title, url.toString());
                }
            } catch (e) { console.error(e); }
        }

        // 2. Start Fetching
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    // HYDRATION FIX: Only render content on client
    if (!isMounted) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
                <div className="animate-pulse text-gray-400">Loading Interface...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 flex justify-between items-center sticky top-0 bg-gray-900 z-10 py-4 border-b border-gray-800">
                    <h1 className="text-2xl font-bold text-red-500">🛡️ PVT Audit Logs (Live)</h1>
                    <div className="flex gap-4 items-center">
                        <span className="text-gray-400 text-sm">{logs.length} entries</span>
                        <button onClick={fetchLogs} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition">Refresh</button>
                        <button
                            onClick={() => window.open('/api/admin/export', '_blank')}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition font-medium flex items-center gap-2"
                        >
                            <span>⬇️</span> Download Detected Events
                        </button>
                        <button
                            onClick={() => window.open('/api/admin/export-logs', '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition font-medium flex items-center gap-2"
                        >
                            <span>📝</span> Download Audit Logs
                        </button>
                        <a href="/" className="text-gray-400 hover:text-white px-4 py-2"> &larr; Back to Feed</a>
                    </div>
                </header>

                {loading && logs.length === 0 && <p className="text-gray-400">Loading logs...</p>}
                {error && <p className="text-red-400 bg-red-900/20 p-4 rounded border border-red-500">Error: {error}</p>}

                <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-700 text-gray-300">
                                <th className="p-3 border-b border-gray-600 w-32">Time</th>
                                <th className="p-3 border-b border-gray-600 w-24">Verdict</th>
                                <th className="p-3 border-b border-gray-600 w-64">Title</th>
                                <th className="p-3 border-b border-gray-600">Reason</th>
                                <th className="p-3 border-b border-gray-600 w-32">Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, idx) => (
                                <tr key={idx} className="hover:bg-gray-750 border-b border-gray-700 last:border-0">
                                    <td className="p-3 text-gray-400 whitespace-nowrap">
                                        {safeDate(log.timestamp)}
                                    </td>
                                    <td className="p-3 font-semibold">
                                        <span className={`px-2 py-1 rounded text-xs ${log.verdict === 'VIOLENCE' ? 'bg-red-900 text-red-200' :
                                            log.verdict === 'SKIPPED' ? 'bg-yellow-900 text-yellow-200' : 'bg-gray-700 text-gray-300'
                                            }`}>
                                            {log.verdict || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-white font-medium break-words">
                                        <a href={log.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {log.title || 'No Title'}
                                        </a>
                                    </td>
                                    <td className="p-3 text-gray-300 text-xs leading-relaxed">
                                        {log.reason || 'No reason provided'}
                                    </td>
                                    <td className="p-3 text-gray-400 text-xs">
                                        {safeHostname(log.url)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
