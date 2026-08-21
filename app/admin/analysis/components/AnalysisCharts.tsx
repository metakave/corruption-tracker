
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { AnalysisEvent } from '../page';
import { getEventBuckets, CATEGORY_COLORS } from '../utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AnalysisChartsProps {
    events: AnalysisEvent[];
    onDistrictClick?: (district: string) => void;
    onCategoryClick?: (category: string) => void;
}

export default function AnalysisCharts({ events, onDistrictClick, onCategoryClick }: AnalysisChartsProps) {

    // 1. Process Data for Timeline
    const dateCount: Record<string, number> = {};
    events.forEach(e => {
        dateCount[e.date] = (dateCount[e.date] || 0) + 1;
    });
    const sortedDates = Object.keys(dateCount).sort();

    const timelineData = {
        labels: sortedDates,
        datasets: [
            {
                label: 'Daily Incidents',
                data: sortedDates.map(d => dateCount[d]),
                borderColor: 'rgb(13, 148, 136)', // Teal-600
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    // 2. Process Data for Districts
    const districtStats: Record<string, { count: number; killed: number; injured: number }> = {};
    events.forEach(e => {
        if (!districtStats[e.district]) {
            districtStats[e.district] = { count: 0, killed: 0, injured: 0 };
        }
        districtStats[e.district].count++;
        districtStats[e.district].killed += e.killed || 0;
        districtStats[e.district].injured += e.injured || 0;
    });
    const sortedDistricts = Object.entries(districtStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10); // Top 10

    const districtData = {
        labels: sortedDistricts.map(d => `${d[0]} (${d[1].count})`),
        datasets: [
            {
                label: 'Deaths',
                data: sortedDistricts.map(d => d[1].killed),
                backgroundColor: 'rgb(239, 68, 68)', // Red-500
                stack: 'casualties'
            },
            {
                label: 'Injured',
                data: sortedDistricts.map(d => d[1].injured),
                backgroundColor: 'rgb(251, 146, 60)', // Orange-400
                stack: 'casualties'
            }
        ]
    };

    // 3. Process Data for Categories
    // Initialize counters with casualty tracking
    const categoryStats = {
        political: { count: 0, killed: 0, injured: 0 },
        mob: { count: 0, killed: 0, injured: 0 },
        communal: { count: 0, killed: 0, injured: 0 },
        gender: { count: 0, killed: 0, injured: 0 },
        criminal: { count: 0, killed: 0, injured: 0 },
        terrorism: { count: 0, killed: 0, injured: 0 }
    };

    events.forEach(e => {
        const buckets = getEventBuckets(e);
        buckets.forEach(bucket => {
            if (categoryStats[bucket]) {
                categoryStats[bucket].count++;
                categoryStats[bucket].killed += e.killed || 0;
                categoryStats[bucket].injured += e.injured || 0;
            }
        });
    });

    const categoryData = {
        labels: [
            `Political (${categoryStats.political.count} | K:${categoryStats.political.killed} I:${categoryStats.political.injured})`,
            `Mob Justice (${categoryStats.mob.count} | K:${categoryStats.mob.killed} I:${categoryStats.mob.injured})`,
            `Communal (${categoryStats.communal.count} | K:${categoryStats.communal.killed} I:${categoryStats.communal.injured})`,
            `Gender Based (${categoryStats.gender.count} | K:${categoryStats.gender.killed} I:${categoryStats.gender.injured})`,
            `Criminal (${categoryStats.criminal.count} | K:${categoryStats.criminal.killed} I:${categoryStats.criminal.injured})`,
            `Terrorism (${categoryStats.terrorism.count} | K:${categoryStats.terrorism.killed} I:${categoryStats.terrorism.injured})`
        ],
        datasets: [
            {
                data: [
                    categoryStats.political.count,
                    categoryStats.mob.count,
                    categoryStats.communal.count,
                    categoryStats.gender.count,
                    categoryStats.criminal.count,
                    categoryStats.terrorism.count
                ],
                backgroundColor: [
                    CATEGORY_COLORS.political,
                    CATEGORY_COLORS.mob,
                    CATEGORY_COLORS.communal,
                    CATEGORY_COLORS.gender,
                    CATEGORY_COLORS.criminal,
                    CATEGORY_COLORS.terrorism
                ],
                borderWidth: 0
            },
        ],
    };

    // 4. Process Data for Roles (Victim vs Perpetrator)
    const perpCount: Record<string, number> = {};
    const vicCount: Record<string, number> = {};

    events.forEach(e => {
        // Perpetrators
        if (e.perpetratorParties) {
            e.perpetratorParties.forEach(p => {
                const name = p.trim(); // Normalize?
                perpCount[name] = (perpCount[name] || 0) + 1;
            });
        }
        // Victims
        if (e.victimParties) {
            e.victimParties.forEach(p => {
                const name = p.trim();
                vicCount[name] = (vicCount[name] || 0) + 1;
            });
        }
    });

    const sortedPerps = Object.entries(perpCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const sortedVics = Object.entries(vicCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const perpData = {
        labels: sortedPerps.map(d => d[0].toUpperCase()),
        datasets: [{
            label: 'Events as Perpetrator',
            data: sortedPerps.map(d => d[1]),
            backgroundColor: 'rgb(239, 68, 68)', // Red-500
        }]
    };

    const vicData = {
        labels: sortedVics.map(d => d[0].toUpperCase()),
        datasets: [{
            label: 'Events as Victim',
            data: sortedVics.map(d => d[1]),
            backgroundColor: 'rgb(59, 130, 246)', // Blue-500
        }]
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Incident Timeline</h3>
                    <div className="h-72 w-full">
                        <Line
                            data={timelineData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }
                            }}
                        />
                    </div>
                </div>

                {/* Districts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Top Affected Districts</h3>
                    <div className="h-72 w-full">
                        <Bar
                            data={districtData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                indexAxis: 'y' as const,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        ticks: {
                                            autoSkip: false,  // Force all labels to show
                                            maxRotation: 0,
                                            minRotation: 0
                                        }
                                    }
                                },
                                onClick: (event, elements) => {
                                    if (elements.length > 0 && onDistrictClick) {
                                        const index = elements[0].index;
                                        const label = districtData.labels[index];
                                        // Extract just the district name "Dhaka" from "Dhaka (51)"
                                        const district = label.split(' (')[0];
                                        if (district) onDistrictClick(district);
                                    }
                                },
                                onHover: (event, chartElement) => {
                                    // @ts-ignore
                                    event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Violence Categories</h3>
                    <div className="h-72 w-full flex justify-center">
                        <Doughnut
                            data={categoryData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'right' } },
                                onClick: (event, elements) => {
                                    if (elements.length > 0 && onCategoryClick) {
                                        const index = elements[0].index;
                                        const label = categoryData.labels[index];
                                        // Label format: "Category (Count | K:0 I:0)"
                                        // We just need the first part "Category"
                                        const categoryName = label.split(' (')[0];

                                        const keyMap: Record<string, string> = {
                                            'Political': 'political',
                                            'Mob Justice': 'mob',
                                            'Communal': 'communal',
                                            'Gender Based': 'gender',
                                            'Criminal': 'criminal',
                                            'Terrorism': 'terrorism'
                                        };

                                        if (categoryName && keyMap[categoryName]) {
                                            onCategoryClick(keyMap[categoryName]);
                                        }
                                    }
                                },
                                onHover: (event, chartElement) => {
                                    // @ts-ignore
                                    event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Role Analysis Section */}
            {/* Role Analysis Section Hidden by User Request
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Top Perpetrators (Inferred)</h3>
                    <div className="h-72 w-full">
                        <Bar
                            data={perpData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                indexAxis: 'y' as const,
                                plugins: { legend: { display: false } },
                                onClick: (event, elements) => {
                                    if (elements.length > 0 && onCategoryClick) {
                                        const index = elements[0].index;
                                        const party = perpData.labels[index];
                                        // Pass specific metric string
                                        onCategoryClick(`perp:${party}`);
                                    }
                                },
                                onHover: (event, chartElement) => {
                                    // @ts-ignore
                                    event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                                }
                            }}
                        />
                    </div>
                </div>

                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Top Victims (Inferred)</h3>
                    <div className="h-72 w-full">
                        <Bar
                            data={vicData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                indexAxis: 'y' as const,
                                plugins: { legend: { display: false } },
                                onClick: (event, elements) => {
                                    if (elements.length > 0 && onCategoryClick) {
                                        const index = elements[0].index;
                                        const party = vicData.labels[index];
                                        onCategoryClick(`victim:${party}`);
                                    }
                                },
                                onHover: (event, chartElement) => {
                                    // @ts-ignore
                                    event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
            */}
        </div>
    );
}
