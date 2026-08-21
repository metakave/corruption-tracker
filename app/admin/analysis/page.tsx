
'use client';

import React, { useEffect, useState } from 'react';
import {
    BarChart3,
    AlertTriangle,
    Users,
    Skull,
    Activity,
    Calendar,
    Download
} from 'lucide-react';
import DashboardCards from './components/DashboardCards';
import AnalysisCharts from './components/AnalysisCharts';
import DrillDownModal from './components/DrillDownModal';
import DateRangeFilter from './components/DateRangeFilter';
import { formatDateUI } from './utils';

import { AnalysisEvent } from './types';

export default function AnalysisPage() {
    const [events, setEvents] = useState<AnalysisEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null); // For drill-down

    // Date State (Default: Current Month to Today)
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

    // Fetch Data Function (Reusable)
    const fetchAnalysisData = async () => {
        try {
            setLoading(true); // Optional: show loading indicator
            const res = await fetch(`/api/admin/analysis?startDate=${dateRange.start}&endDate=${dateRange.end}&t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            setEvents(data.events || []);
        } catch (e) {
            console.error("Failed to load analysis data", e);
        } finally {
            setLoading(false);
        }
    };


    // Initial Load & On Date Change
    useEffect(() => {
        fetchAnalysisData();
    }, [dateRange]);


    // Parse Category Helper
    function getCategories(e: AnalysisEvent): string[] {
        if (!e.category) return ['other'];
        try {
            const parsed = JSON.parse(e.category);
            return Array.isArray(parsed) ? parsed : [e.category];
        } catch {
            return [e.category];
        }
    }

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
            terrorism: 0,
            other: 0
        };

        events.forEach(e => {
            const categories = getCategories(e);
            categories.forEach(cat => {
                const normalized = cat.toLowerCase().trim();
                if (normalized.includes('political')) s.political++;
                else if (normalized.includes('mob') || normalized.includes('lynch')) s.mob++;
                else if (normalized.includes('communal') || normalized.includes('religious')) s.communal++;
                else if (normalized.includes('gender')) s.gender++;
                else if (normalized.includes('terrorism') || normalized.includes('extremist')) s.terrorism++;
                else if (normalized.includes('criminal')) s.criminal++;
                else s.criminal++; // Merge other into criminal
            });
        });

        return s;
    }, [events]);

    // Drill Down Handler
    const handleCardClick = (metric: string) => {
        setSelectedMetric(metric);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
            {/* Header */}
            <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-teal-800 flex items-center gap-2">
                        <Activity className="h-6 w-6" />
                        Violence Analysis System
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Live Monitoring • {formatDateUI(dateRange.start)} to {formatDateUI(dateRange.end)}
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <DateRangeFilter
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onDateChange={(start, end) => setDateRange({ start, end })}
                    />
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition">
                        <Download className="h-4 w-4" /> Export Report
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading analysis data...</div>
            ) : (
                <>
                    {/* Stat Cards Grid */}
                    <DashboardCards stats={stats} onCardClick={handleCardClick} />

                    {/* Charts Section */}
                    <AnalysisCharts
                        events={events}
                        onDistrictClick={(d) => setSelectedMetric(`district:${d}`)}
                        onCategoryClick={handleCardClick}
                    />

                </>
            )}

            {/* Drill Down Modal */}
            {selectedMetric && (
                <DrillDownModal
                    metric={selectedMetric}
                    events={events} // Pass full list, modal filters it
                    onClose={() => setSelectedMetric(null)}
                    onUpdate={fetchAnalysisData} // Pass refresh function
                />
            )}
        </div>
    );
}

