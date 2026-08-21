
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
    url: string;
    category?: string; // Derived on frontend
}

export default function AnalysisPage() {
    const [events, setEvents] = useState<AnalysisEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null); // For drill-down

    // Fetch Data Function (Reusable)
    const fetchAnalysisData = async () => {
        try {
            setLoading(true); // Optional: show loading indicator
            const res = await fetch('/api/admin/analysis?startDate=2026-01-01&endDate=2026-01-31');
            const data = await res.json();
            setEvents(data.events);
        } catch (e) {
            console.error("Failed to load analysis data", e);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchAnalysisData();
    }, []);

    // ... (rest of the component) ...

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
            {/* ... (header and content) ... */}

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


    // Derived Stats
    const stats = {
        total: events.length,
        killed: events.reduce((s, e) => s + e.killed, 0),
        injured: events.reduce((s, e) => s + e.injured, 0),
        political: events.filter(e => hasRealPoliticalParty(e)).length,
        mob: events.filter(e => isMobJustice(e)).length,
        gender: events.filter(e => isGenderViolence(e)).length
    };

    // Helper Categorization Logic (Client-side mirror of ReportService for instant feedback)
    function isMobJustice(e: AnalysisEvent) {
        const text = (e.title + ' ' + e.summary).toLowerCase();
        return ['mob', 'ganopituni', 'mass beating', 'গণপিটুনি', 'পিটিয়ে', 'এলাকাবাসী'].some(k => text.includes(k));
    }

    function isGenderViolence(e: AnalysisEvent) {
        const text = (e.title + ' ' + e.summary).toLowerCase();
        return ['rape', 'assault', 'dowry', 'ধর্ষণ', 'নির্যাতন', 'যৌন'].some(k => text.includes(k));
    }

    // Helper to filter out "fake" parties like "Locals", "Unknown", "Robbers"
    function hasRealPoliticalParty(e: AnalysisEvent) {
        if (!e.politicalParties || e.politicalParties.length === 0) return false;

        const IGNORED_ACTORS = [
            'unknown', 'locals', 'robbers', 'miscreants', 'criminals', 'students', 'fishermen',
            'villagers', 'teachers', 'victim', 'family', 'truck driver', 'truck', 'police', 'ansar',
            'accused', 'son', 'daughter', 'husband', 'wife', 'child', 'relative',
            'daughter-in-law', 'mother-in-law', 'father-in-law', 'brother-in-law', 'sister-in-law',
            'begum', 'khatun'
        ];

        // Return true if at least one party is NOT in the ignored list
        return e.politicalParties.some(p => {
            const lower = p.toLowerCase();
            return !IGNORED_ACTORS.some(ignored => lower.includes(ignored));
        });
    }

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
                        Live Monitoring • January 2026
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg font-medium hover:bg-teal-100 transition">
                        <Calendar className="h-4 w-4" /> Jan 2026
                    </button>
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
                    <AnalysisCharts events={events} />

                </>
            )}

            {/* Drill Down Modal */}
            {selectedMetric && (
                <DrillDownModal
                    metric={selectedMetric}
                    events={events} // Pass full list, modal filters it
                    onClose={() => setSelectedMetric(null)}
                />
            )}
        </div>
    );
}

