'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Table as TableIcon, BarChart3, Info, Map, Download, ShieldAlert, Building2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function DashboardSidebar() {
    const pathname = usePathname()
    const { t } = useLanguage()

    if (pathname === '/map') return null

    const navItems = [
        { nameKey: 'dashboard', href: '/', icon: LayoutDashboard },
        { nameKey: 'map', href: '/map', icon: Map },
        { nameKey: 'analytics', href: '/statistics', icon: BarChart3 },
        { nameKey: 'data_table', href: '/data', icon: TableIcon },
        { nameKey: 'download_data', href: '/data', icon: Download },
        { nameKey: 'about', href: '/about', icon: Info },
    ]

    return (
        <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 min-h-screen">
            {/* Brand Logo */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                    <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">
                        বাংলাদেশ <span className="text-emerald-600 dark:text-emerald-400">দুর্নীতি</span>
                    </h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Corruption Tracker</p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1 flex-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.nameKey}
                            href={item.href}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                                isActive
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
                            <span>{t(item.nameKey)}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Status Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium text-zinc-600 dark:text-zinc-300">ক্রলার ও এআই সক্রিয়</span>
                </div>
                <p className="text-[11px] text-zinc-400">সংস্করণ ১.০ (দুর্নীতি নজরদারি)</p>
            </div>
        </aside>
    )
}
