'use client'

import React, { useEffect, useState } from 'react'
import {
    Chart as ChartJS,
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
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import StatsPanel from '@/components/StatsPanel'
import { useTheme } from '@/components/theme-provider'
import { formatDate } from '@/lib/utils'

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
)

export default function AnalyticsPage() {
    const { resolvedTheme } = useTheme()
    const [loading, setLoading] = useState(true)
    const [trendData, setTrendData] = useState<any>(null)
    const [casualtyData, setCasualtyData] = useState<any>(null)
    const [districtData, setDistrictData] = useState<any>(null)
    const [totalKilled, setTotalKilled] = useState(0)
    const [totalInjured, setTotalInjured] = useState(0)

    // Force chart re-render when theme changes by adding theme to key
    const chartKey = resolvedTheme || 'default'

    // Chart.js colors
    const isDark = resolvedTheme === 'dark'
    const textColor = isDark ? '#e5e7eb' : '#374151' // gray-200 vs gray-700
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
    const barColor = isDark ? 'rgba(255, 99, 132, 0.8)' : 'rgba(15, 23, 42, 0.8)'

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(json => {
                if (json.stats) {
                    const stats = json.stats

                    // 1. Trend
                    setTrendData({
                        labels: Object.keys(stats.trend),
                        datasets: [{
                            fill: true,
                            label: 'Incidents Trend',
                            data: Object.values(stats.trend),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                        }]
                    })

                    // 2. Casualties
                    setTotalKilled(stats.totalKilled)
                    setTotalInjured(stats.totalInjured)
                    setCasualtyData({
                        labels: ['Killed', 'Injured'],
                        datasets: [{
                            data: [stats.totalKilled, stats.totalInjured],
                            backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(234, 179, 8, 0.8)'],
                            borderWidth: 0
                        }]
                    })

                    // 3. Districts
                    setDistrictData({
                        labels: stats.districts.map((d: any) => d.district),
                        datasets: [{
                            label: 'Incidents Count',
                            data: stats.districts.map((d: any) => d.count),
                            backgroundColor: isDark ? 'rgba(255, 99, 132, 0.8)' : 'rgba(15, 23, 42, 0.8)',
                            borderRadius: 4
                        }]
                    })
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }, [isDark])


    return (
        <div className="p-6 md:p-8 space-y-8 bg-gray-50 dark:bg-black transition-colors">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Deep dive into political violence trends and statistics.</p>
            </div>

            {/* Row 1: Big Trend Chart */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">30-Day Incident Trend</h3>
                <div className="h-[300px] w-full">
                    {trendData && (
                        <Line
                            key={chartKey + 'trend'}
                            data={trendData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        grid: { color: gridColor },
                                        ticks: { color: textColor }
                                    },
                                    x: {
                                        grid: { color: gridColor },
                                        ticks: { color: textColor }
                                    }
                                },
                                plugins: {
                                    legend: { labels: { color: textColor } }
                                }
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Row 2: Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Casualty Ratio</h3>
                    <div className="h-[250px] flex justify-center">
                        {casualtyData && (
                            <Doughnut
                                key={chartKey + 'donut'}
                                data={casualtyData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { labels: { color: textColor } }
                                    }
                                }}
                            />
                        )}
                    </div>
                    <div className="mt-4 text-center grid grid-cols-2 gap-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            <span className="block text-xl font-bold text-red-600 dark:text-red-400">{totalKilled}</span>
                            <span className="text-xs text-red-400 uppercase font-bold">Total Deaths</span>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                            <span className="block text-xl font-bold text-yellow-600 dark:text-yellow-400">{totalInjured}</span>
                            <span className="text-xs text-yellow-400 uppercase font-bold">Total Injured</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Top 10 Violent Districts</h3>
                    <div className="h-[300px]">
                        {districtData && (
                            <Bar
                                key={chartKey + 'bar'}
                                data={districtData}
                                options={{
                                    indexAxis: 'y',
                                    maintainAspectRatio: false,
                                    scales: {
                                        x: {
                                            grid: { display: false },
                                            ticks: { color: textColor }
                                        },
                                        y: {
                                            grid: { display: false },
                                            ticks: { color: textColor }
                                        }
                                    },
                                    plugins: {
                                        legend: { labels: { color: textColor } }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Row 3: Party Analysis (Moved from Dashboard) */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                <StatsPanel />
            </div>
        </div>
    )
}
