'use client'

import React from 'react'
import { CORRUPTION_CATEGORIES, CORRUPTION_SECTORS } from '@/lib/constants'

interface FiltersProps {
    filters: {
        search: string
        district: string
        category: string
        sector: string
        status: string
        timeRange: string
        source: string
    }
    setFilters: (filters: any) => void
    districts: string[]
}

export function TableFilters({ filters, setFilters, districts }: FiltersProps) {
    const handleChange = (key: string, value: string) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }))
    }

    const resetFilters = () => {
        setFilters({
            search: '',
            district: 'All',
            category: 'All',
            sector: 'All',
            status: 'All',
            timeRange: 'all',
            source: 'All'
        })
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl mb-6 shadow-sm transition-colors space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Search */}
                <div className="col-span-1 sm:col-span-2 md:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">কীওয়ার্ড খুঁজুন (Search)</label>
                    <input
                        type="text"
                        placeholder="শিরোনাম, সংস্থা বা অভিযুক্তের নাম..."
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-zinc-400"
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                    />
                </div>

                {/* District */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">জেলা (District)</label>
                    <select
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                        value={filters.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                    >
                        <option value="All">সকল জেলা (All Districts)</option>
                        {districts.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">দুর্নীতির ধরন (Category)</label>
                    <select
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                        value={filters.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                    >
                        <option value="All">সকল ধরন (All)</option>
                        {CORRUPTION_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Sector */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">খাত/মন্ত্রণালয় (Sector)</label>
                    <select
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                        value={filters.sector}
                        onChange={(e) => handleChange('sector', e.target.value)}
                    >
                        <option value="All">সকল খাত (All)</option>
                        {CORRUPTION_SECTORS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Time Range */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">সময়কাল (Time Range)</label>
                    <select
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                        value={filters.timeRange}
                        onChange={(e) => handleChange('timeRange', e.target.value)}
                    >
                        <option value="all">সব সময় (All Time)</option>
                        <option value="today">আজ (Today)</option>
                        <option value="yesterday">গতকাল (Yesterday)</option>
                        <option value="7d">গত ৭ দিন (7 Days)</option>
                        <option value="30d">গত ৩০ দিন (30 Days)</option>
                        <option value="3m">গত ৩ মাস (3 Months)</option>
                        <option value="1y">গত ১ বছর (1 Year)</option>
                    </select>
                </div>
            </div>

            {/* Sub Controls row */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-3">
                    <span className="text-zinc-400">উৎস ফিল্টার:</span>
                    <select
                        className="bg-transparent text-zinc-600 dark:text-zinc-300 font-medium focus:outline-none cursor-pointer"
                        value={filters.source}
                        onChange={(e) => handleChange('source', e.target.value)}
                    >
                        <option value="All">সকল পত্রিকা (All Sources)</option>
                        <option value="Prothom Alo">Prothom Alo (প্রথম আলো)</option>
                        <option value="Samakal">Samakal (সমকাল)</option>
                        <option value="Jugantor">Jugantor (যুগান্তর)</option>
                        <option value="Ajker Patrika">Ajker Patrika (আজকের পত্রিকা)</option>
                        <option value="Dhaka Post">Dhaka Post (ঢাকা পোস্ট)</option>
                        <option value="Ittefaq">Ittefaq (ইত্তেফাক)</option>
                        <option value="Jamuna TV">Jamuna TV (যমুনা টিভি)</option>
                    </select>
                </div>

                <button
                    onClick={resetFilters}
                    className="text-xs text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                    ফিল্টার রিসেট (Reset)
                </button>
            </div>
        </div>
    )
}
