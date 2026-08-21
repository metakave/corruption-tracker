'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Table as TableIcon,
    BarChart3,
    Info,
    Menu,
    Search,
    Search,
    Bell,
    Globe,
    Radio,
    Briefcase,
    Activity
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from "@/context/LanguageContext";

const NAV_ITEMS = [
    { labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
    { labelKey: 'live_feed', href: '/feed', icon: Radio },
    { labelKey: 'analytics', href: '/analytics', icon: BarChart3 },
    { labelKey: 'data_table', href: '/data', icon: TableIcon },
    { labelKey: 'faq', href: '/faq', icon: Globe },
    { labelKey: 'about', href: '/about', icon: Info },
    { labelKey: 'business', href: '/business', icon: Briefcase },
];

export default function DashboardNavbar() {
    const { t, language } = useLanguage()
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20">
            {/* Left Side: Title */}
            <div className="flex items-center gap-3 flex-1">
                {/* Mobile Menu Trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                            <Menu className="w-6 h-6" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0 border-r border-gray-200 bg-white dark:bg-slate-900">
                        {/* Mobile Sidebar Content */}
                        <div className="h-full flex flex-col">
                            {/* Branding */}
                            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800">
                                <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
                                    <div className="relative w-8 h-8">
                                        <Image
                                            src="/images/logo-bn.png"
                                            alt="Logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className={`text-gray-900 dark:text-white text-xl whitespace-nowrap ${language === 'bn' ? 'font-bengali' : ''}`}>
                                        <span className="text-red-600 dark:text-red-500">{t('app_name_violence')}</span> {t('app_name_tracker')}
                                    </span>
                                </Link>
                            </div>
                            {/* Nav Items */}
                            <nav className="flex-1 px-4 py-4 space-y-1">
                                {NAV_ITEMS.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <item.icon className="w-5 h-5 text-gray-500" />
                                        {t(item.labelKey)}
                                    </Link>
                                ))}
                            </nav>

                            {/* Mobile Footer Actions (Settings) */}
                            <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('theme')}</span>
                                    <ThemeSelector />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('notifications')}</span>
                                    <button
                                        onClick={() => {
                                            setIsNotificationOpen(!isNotificationOpen);
                                            // Close sheet if needed, or keep open. For now just toggle panel.
                                        }}
                                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
                                    >
                                        <Activity className="w-5 h-5" />
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2 md:hidden">
                    <div className="relative w-8 h-8 bg-white rounded-full overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                        <Image
                            src="/images/logo-bn.png"
                            alt="Logo"
                            fill
                            className="object-cover p-0.5"
                        />
                    </div>
                    <h2 className={`text-sm font-semibold text-gray-800 dark:text-white truncate max-w-[140px] leading-tight ${language === 'bn' ? 'font-bengali' : ''}`}>
                        <span className="text-red-600 dark:text-red-500 block sm:inline">{t('app_name_violence')}</span> {t('app_name_tracker')}
                    </h2>
                </div>

                <div className="hidden md:flex flex-1"></div>
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-4">

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Theme Selector (Desktop Only) */}
                <div className="hidden md:block">
                    <ThemeSelector />
                </div>

                {/* Divider */}
                <div className="hidden md:flex h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>

                {/* Desktop Status Indicators */}
                <div className="hidden md:flex items-center text-xs font-mono text-gray-500 dark:text-gray-400">
                    <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30 mr-2 font-bold">{t('live')}</span>
                    <span className="text-gray-400 dark:text-gray-500 border-l border-gray-300 dark:border-gray-700 pl-2">{t('tracking_sources')}</span>
                </div>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>

                {/* Notification Bell */}
                <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="hidden md:block relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <Activity className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>

                {/* Notification Panel */}
                <NotificationPanel
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                />
            </div>
        </header>
    );
}

// Need to import the switchers and notification panel
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSelector } from "./ThemeSelector";
import { NotificationPanel } from "./NotificationPanel";
