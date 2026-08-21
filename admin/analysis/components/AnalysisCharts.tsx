
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

} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { AnalysisEvent } from '../page';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface AnalysisChartsProps {
    events: AnalysisEvent[];
}

export default function AnalysisCharts({ events }: AnalysisChartsProps) {

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
    const districtCount: Record<string, number> = {};
    events.forEach(e => {
        districtCount[e.district] = (districtCount[e.district] || 0) + 1;
    });
    const sortedDistricts = Object.entries(districtCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15); // Top 15

    const districtData = {
        labels: sortedDistricts.map(d => d[0]),
        datasets: [
            {
                label: 'Incidents per District',
                data: sortedDistricts.map(d => d[1]),
                backgroundColor: 'rgb(20, 184, 166)', // Teal-500
            }
        ]
    };

    // 3. Process Data for Categories
    let political = 0, mob = 0, gender = 0, other = 0;

    events.forEach(e => {
        const text = (e.title + ' ' + e.summary).toLowerCase();
        if (e.isPolitical) {
            political++;
        } else if (['mob', 'ganopituni', 'mass beating'].some(k => text.includes(k))) {
            mob++;
        } else if (['rape', 'assault', 'dowry', 'woman'].some(k => text.includes(k))) {
            gender++;
        } else {
            other++;
        }
    });

    const categoryData = {
        labels: ['Political', 'Mob Justice', 'Gender-Based', 'Other'],
        datasets: [
            {
                data: [political, mob, gender, other],
                backgroundColor: [
                    'rgb(220, 38, 38)', // Red
                    'rgb(245, 158, 11)', // Amber
                    'rgb(147, 51, 234)', // Purple
                    'rgb(107, 114, 128)', // Gray
                ],
                borderWidth: 0
            },
        ],
    };

    return (
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
                            plugins: { legend: { display: false } }
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
                            plugins: { legend: { position: 'right' } }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
