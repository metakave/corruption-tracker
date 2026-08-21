
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

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/logs');
            if (!res.ok) throw new Error('Failed to fetch logs');
            const data = await res.json();
            setLogs(data.logs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000); // Auto refresh
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-red-500">🛡️ PVT Audit Logs (Live)</h1>
                <div className="flex gap-4">
                    <button
                        onClick={fetchLogs}
                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={() => window.open('/api/admin/export', '_blank')}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition font-medium flex items-center gap-2"
                    >
                        <span>⬇️</span> Download Detected Events (CSV)
                    </button>
                    <button
                        onClick={() => window.open('/api/admin/export-logs', '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition font-medium flex items-center gap-2"
                    >
                        <span>📝</span> Download Audit Logs
                    </button>
                    <a
                        href="/admin/analysis"
                        className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded text-sm transition font-medium flex items-center gap-2"
                    >
                        <span>📊</span> Analysis System
                    </a>
                    <a
                        href="/admin-prisma/"
                        target="_blank"
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm transition font-medium flex items-center gap-2"
                    >
                        <span>🗄️</span> View Raw Database
                    </a>
                    <a href="/" className="text-gray-400 hover:text-white px-4 py-2"> &larr; Back to Feed</a>
                </div>
            </header>

            {loading && logs.length === 0 && <p className="text-gray-400">Loading logs...</p>}
            {error && <p className="text-red-400">Error: {error}</p>}

            <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-700 text-gray-300">
                            <th className="p-3 border-b border-gray-600">Time</th>
                            <th className="p-3 border-b border-gray-600">Verdict</th>
                            <th className="p-3 border-b border-gray-600 w-1/4">Title</th>
                            <th className="p-3 border-b border-gray-600 w-1/3">Reason</th>
                            <th className="p-3 border-b border-gray-600">Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, idx) => (
                            <tr key={idx} className="hover:bg-gray-750 border-b border-gray-700 last:border-0">
                                <td className="p-3 text-gray-400 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="p-3 font-semibold">
                                    <span className={`px-2 py-1 rounded text-xs ${log.verdict === 'VIOLENCE' ? 'bg-red-900 text-red-200' :
                                        log.verdict === 'SKIPPED' ? 'bg-yellow-900 text-yellow-200' : 'bg-gray-700 text-gray-300'
                                        }`}>
                                        {log.verdict}
                                    </span>
                                </td>
                                <td className="p-3 text-white font-medium">
                                    <a href={log.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {log.title}
                                    </a>
                                </td>
                                <td className="p-3 text-gray-300 text-xs leading-relaxed">
                                    {log.reason}
                                </td>
                                <td className="p-3 text-gray-400 text-xs">
                                    {new URL(log.url).hostname.replace('www.', '')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
                Auto-refreshes every 30 seconds. Displaying last 100 entries.
            </p>
        </div>
    );
}
