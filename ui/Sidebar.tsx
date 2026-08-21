'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Table as TableIcon, BarChart3, Radio, Info, Briefcase, Bot, Globe, Map } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

export default function DashboardSidebar() {
    const pathname = usePathname()
    const { t, language } = useLanguage()

    if (pathname === '/map') return null

    const navItems = [
        { nameKey: 'dashboard', href: '/', icon: LayoutDashboard },
        { nameKey: 'live_feed', href: '/feed', icon: Radio },
        { nameKey: 'analytics', href: '/analytics', icon: BarChart3 },
        { nameKey: 'data_table', href: '/data', icon: TableIcon },
        { nameKey: 'faq', href: '/faq', icon: Globe },
        { nameKey: 'about', href: '/about', icon: Info },
        { nameKey: 'business', href: '/business', icon: Briefcase },
    ]

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 text-gray-900 dark:text-white h-screen sticky top-0 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-slate-800 transition-colors">
            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800">
                <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
                    <div className="relative w-12 h-12 bg-white rounded-full overflow-hidden shadow-sm border-2 border-slate-100 dark:border-slate-700">
                        <Image
                            src="/images/logo-bn.png"
                            alt="Logo"
                            fill
                            className="object-cover p-1"
                        />
                    </div>
                    <span className={`text-gray-900 dark:text-white text-xl whitespace-nowrap ${language === 'bn' ? 'font-bengali' : ''}`}>
                        <span className="text-red-600 dark:text-red-500">{t('app_name_violence')}</span>{' '}{t('app_name_tracker')}
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                                ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400'
                                : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            {t(item.nameKey)}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Bot className="w-5 h-5 text-indigo-100" />
                            </div>
                            <span className="text-xs font-bold text-indigo-100 uppercase tracking-wide">{t('ai_engine')}</span>
                        </div>
                        <p className="text-xs text-indigo-100 mb-3 leading-relaxed">
                            {t('tracking_sources')}
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-xs font-bold">{t('crawler_active')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
