'use client'

import React from 'react'
import { PARTY_CATEGORIES } from '@/lib/constants'

interface FiltersProps {
    filters: {
        search: string
        district: string
        type: string
        minSeverity: string
        timeRange: string
        partyCategory: string
        source: string
    }
    setFilters: (filters: any) => void
    districts: string[]
}

export function TableFilters({ filters, setFilters, districts }: FiltersProps) {
    const handleChange = (key: string, value: string) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }))
    }

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end shadow-sm transition-colors">

            {/* Search */}
            <div className="w-full md:w-64">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search</label>
                <input
                    type="text"
                    placeholder="Search keywords..."
                    className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-gray-400"
                    value={filters.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                />
            </div>

            {/* Time Range */}
            <div className="w-40">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Time Range</label>
                <select
                    className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={filters.timeRange}
                    onChange={(e) => handleChange('timeRange', e.target.value)}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="3m">Last 3 Months</option>
                    <option value="6m">Last 6 Months</option>
                    <option value="1y">Last 1 Year</option>
                </select>
            </div>

            {/* District */}
            <div className="w-40">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">District</label>
                <select
                    className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={filters.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                >
                    <option value="All">All Districts</option>
                    {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* Party Category */}
            <div className="w-48">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Party / Actor</label>
                <select
                    className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={filters.partyCategory}
                    onChange={(e) => handleChange('partyCategory', e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {PARTY_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                </select>
            </div>



            {/* Min Severity */}
            <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min Severity (1-10)</label>
                <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Min"
                    className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-gray-400"
                    value={filters.minSeverity}
                    onChange={(e) => handleChange('minSeverity', e.target.value)}
                />
            </div>

        </div>
    )
}
