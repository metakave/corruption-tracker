'use client'

import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme-provider'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

export default function StatsPanel() {
    const { theme } = useTheme()
    const [data, setData] = useState<any>(null)
    const [viewMode, setViewMode] = useState<'bar' | 'pie'>('bar')
    const [sortBy, setSortBy] = useState<'count' | 'alpha'>('count')

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(json => {
                if (!json.stats || !json.stats.parties) return;

                const categoryCounts = json.stats.parties

                // Filter and Sort
                let labels = Object.keys(categoryCounts).filter(k => categoryCounts[k] > 0)
                if (sortBy === 'count') {
                    labels.sort((a, b) => categoryCounts[b] - categoryCounts[a])
                } else {
                    labels.sort()
                }

                const values = labels.map(k => categoryCounts[k])

                // Custom Colors for known parties
                const bgColors = labels.map(l => {
                    if (l.includes('Awami')) return 'rgba(34, 197, 94, 0.7)' // Green
                    if (l.includes('BNP')) return 'rgba(59, 130, 246, 0.7)' // Blue
                    if (l.includes('Jamaat')) return 'rgba(249, 115, 22, 0.7)' // Orange
                    if (l.includes('Police')) return 'rgba(99, 102, 241, 0.7)' // Indigo
                    if (l.includes('Student')) return 'rgba(236, 72, 153, 0.7)' // Pink
                    return 'rgba(148, 163, 184, 0.7)' // Slate for others
                })

                const borderColors = labels.map(l => {
                    if (l.includes('Awami')) return 'rgb(22, 163, 74)'
                    if (l.includes('BNP')) return 'rgb(37, 99, 235)'
                    if (l.includes('Jamaat')) return 'rgb(234, 88, 12)'
                    if (l.includes('Police')) return 'rgb(79, 70, 229)'
                    if (l.includes('Student')) return 'rgb(219, 39, 119)'
                    return 'rgb(100, 116, 139)'
                })

                setData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Incidents',
                            data: values,
                            backgroundColor: bgColors,
                            borderColor: borderColors,
                            borderWidth: 1,
                            borderRadius: 4,
                        }
                    ]
                })
            })
    }, [sortBy])

    // Determine colors based on theme
    const isDark = theme === 'dark'
    const textColor = isDark ? '#e5e7eb' : '#374151' // gray-200 vs gray-700
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)'

    if (!data) return <div className="h-64 flex items-center justify-center text-gray-400">Loading analysis...</div>

    const chartOptions = {
        indexAxis: 'y' as const, // Horizontal bar
        responsive: true,
        plugins: {
            legend: {
                display: false, // Hide duplicate legend in bar mode
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    color: gridColor
                },
                ticks: {
                    color: textColor
                }
            },
            y: {
                grid: {
                    display: false
                },
                ticks: {
                    color: textColor
                }
            }
        }
    }

    return (
        <div className="w-full h-full flex flex-col transition-colors">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100">Violence by Party / Group</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                        Distribution of {data?.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0) || 0} recorded incidents ({new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})
                    </p>
                </div>

                <div className="flex gap-2 bg-slate-100 dark:bg-gray-800/50 p-1 rounded-lg border border-transparent dark:border-gray-700">
                    <button
                        onClick={() => setSortBy('count')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${sortBy === 'count' ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'}`}
                    >
                        Highest
                    </button>
                    <button
                        onClick={() => setSortBy('alpha')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${sortBy === 'alpha' ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'}`}
                    >
                        A-Z
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-[300px] w-full">
                {/* Chart Container */}
                <Bar key={theme} data={data} options={chartOptions} />
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 dark:border-gray-800 pt-4">
                {/* Mini Stat Blocks */}
                {data.labels.slice(0, 4).map((label: string, i: number) => (
                    <div key={i} className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500 tracking-wider truncate">{label}</span>
                        <span className="text-xl font-bold text-slate-700 dark:text-gray-200">{data.datasets[0].data[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
