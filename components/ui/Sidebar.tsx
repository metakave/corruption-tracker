'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
    LayoutDashboard, 
    Table as TableIcon, 
    BarChart3, 
    Info, 
    Map, 
    ShieldAlert, 
    Radio, 
    Download, 
    HelpCircle, 
    Briefcase 
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function DashboardSidebar() {
    const pathname = usePathname()
    const { t, language } = useLanguage()

    if (pathname === '/map') return null

    const navItems = [
        { nameKey: 'dashboard', href: '/', icon: LayoutDashboard },
        { nameKey: 'live_feed', href: '/feed', icon: Radio },
        { nameKey: 'map', href: '/map', icon: Map },
        { nameKey: 'analytics', href: '/analytics', icon: BarChart3 },
        { nameKey: 'data_table', href: '/data', icon: TableIcon },
        { nameKey: 'download_data', href: '/download', icon: Download },
        { nameKey: 'faq', href: '/faq', icon: HelpCircle },
        { nameKey: 'about', href: '/about', icon: Info },
        { nameKey: 'technical_collaboration', href: '/business', icon: Briefcase },
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
                        {language === 'bn' ? (
                            <>বাংলাদেশ <span className="text-emerald-600 dark:text-emerald-400">দুর্নীতি</span> ট্র্যাকার</>
                        ) : (
                            <>Bangladesh <span className="text-emerald-600 dark:text-emerald-400">Corruption</span> Tracker</>
                        )}
                    </h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                        {language === 'bn' ? 'আর্থিক গোয়েন্দা বিশ্লেষণ' : 'Financial Intelligence'}
                    </p>
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
                            target={item.href === '/map' ? '_blank' : undefined}
                            rel={item.href === '/map' ? 'noopener noreferrer' : undefined}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                                isActive
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                                    : item.nameKey === 'technical_collaboration'
                                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-medium'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : item.nameKey === 'technical_collaboration' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
                            <span>{t(item.nameKey)}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Status Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium text-zinc-600 dark:text-zinc-300">{t('crawler_ai_active')}</span>
                </div>
                <p className="text-[11px] text-zinc-400">{t('sidebar_version')}</p>
            </div>
        </aside>
    )
}
