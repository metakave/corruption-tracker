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
    Bell,
    Globe,
    Radio,
    Briefcase,
    Activity,
    FileText,
    ChevronDown,
    Download
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardNavbar() {
    const pathname = usePathname()
    const { t, language } = useLanguage()

    const NAV_ITEMS = [
        { labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
        { labelKey: 'live_feed', href: '/feed', icon: Radio },
        {
            labelKey: 'insights',
            href: '#',
            icon: FileText,
            children: [
                {
                    labelKey: 'monthly_report',
                    href: '#',
                    children: [
                        { labelKey: 'report_summary', href: '/insights/january-2026/summary' },
                        {
                            labelKey: 'report_full',
                            href: '/insights/january-2026/full',
                            children: [
                                { labelKey: 'category_political_violence', href: language === 'en' ? '/insights/january-2026/full#political-violence' : '/insights/january-2026/full#রাজনৈতিক-সহিংসতা' },
                                { labelKey: 'category_mob_justice', href: language === 'en' ? '/insights/january-2026/full#mob-justice' : '/insights/january-2026/full#মব-জাস্টিস' },
                                { labelKey: 'category_communal_violence', href: language === 'en' ? '/insights/january-2026/full#communal-violence' : '/insights/january-2026/full#সাম্প্রদায়িক-সহিংসতা' },
                                { labelKey: 'category_gender_based_violence', href: language === 'en' ? '/insights/january-2026/full#gender-based-violence' : '/insights/january-2026/full#জেন্ডার-ভিত্তিক-সহিংসতা' },
                                { labelKey: 'category_criminal_violence', href: language === 'en' ? '/insights/january-2026/full#criminal-violence' : '/insights/january-2026/full#অপরাধমূলক-সহিংসতা' },
                            ]
                        },
                    ]
                },
                { labelKey: 'video_insights', href: '/insights/bangladesh-election-violence-dhaka-stream-interview' },
                { labelKey: 'history_political_violence', href: '/insights/human-history-political-violence' },
                { labelKey: 'south_asia_election_violence', href: '/insights/election-violence-south-asia-nations' },
            ]
        },
        { labelKey: 'analytics', href: '/analytics', icon: BarChart3 },
        { labelKey: 'data_table', href: '/data', icon: TableIcon },
        { labelKey: 'download_data', href: '/download', icon: Download },
        { labelKey: 'faq', href: '/faq', icon: Globe },
        { labelKey: 'about', href: '/about', icon: Info },
        { labelKey: 'business', href: '/business', icon: Briefcase },
    ];

    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isInsightsOpen, setIsInsightsOpen] = useState(false) // For mobile accordion
    const [openSubMenus, setOpenSubMenus] = useState<string[]>([])

    const toggleSubMenu = (key: string) => {
        setOpenSubMenus(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )
    }

    if (pathname === '/map') return null

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20">
            {/* Left Side: Title */}
            <div className="flex items-center gap-3 flex-1">
                {/* Mobile Menu Trigger */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                            <Menu className="w-6 h-6" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0 border-r border-gray-200 bg-white dark:bg-slate-900 overflow-y-auto">
                        {/* Mobile Sidebar Content */}
                        <div className="h-full flex flex-col">
                            {/* Branding */}
                            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800 shrink-0">
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 font-bold text-xl tracking-tight"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="relative w-8 h-8">
                                        <Image
                                            src="/images/logo-bn.png"
                                            alt="Logo"
                                            fill
                                            priority
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
                                    <div key={item.labelKey}>
                                        {item.children ? (
                                            <div>
                                                <button
                                                    onClick={() => setIsInsightsOpen(!isInsightsOpen)}
                                                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className="w-5 h-5 text-gray-500" />
                                                        {t(item.labelKey)}
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 transition-transform ${isInsightsOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                {isInsightsOpen && (
                                                    <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-slate-800 pl-2">
                                                        {item.children.map(child => (
                                                            <div key={child.labelKey || child.href}>
                                                                {child.children ? (
                                                                    <div>
                                                                        <button
                                                                            onClick={() => toggleSubMenu(child.labelKey)}
                                                                            className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                                                                        >
                                                                            {t(child.labelKey)}
                                                                            <ChevronDown className={`w-3 h-3 transition-transform ${openSubMenus.includes(child.labelKey) ? 'rotate-180' : ''}`} />
                                                                        </button>
                                                                        {openSubMenus.includes(child.labelKey) && (
                                                                            <div className="ml-3 border-l-2 border-gray-100 dark:border-slate-800 pl-2 space-y-1 mt-1">
                                                                                {child.children.map(subChild => (
                                                                                    <div key={subChild.href}>
                                                                                        <Link
                                                                                            href={subChild.href}
                                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                                            className="block px-3 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                                                                                        >
                                                                                            {t(subChild.labelKey)}
                                                                                        </Link>
                                                                                        {subChild.children && (
                                                                                            <div className="ml-3 border-l-2 border-gray-100 dark:border-slate-800 pl-2 space-y-1 mt-1">
                                                                                                {subChild.children.map(deepChild => (
                                                                                                    <Link
                                                                                                        key={deepChild.href}
                                                                                                        href={deepChild.href}
                                                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                                                        className="block px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                                                                                    >
                                                                                                        {t(deepChild.labelKey)}
                                                                                                    </Link>
                                                                                                ))}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <Link
                                                                        href={child.href}
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="block px-3 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                                                                    >
                                                                        {t(child.labelKey)}
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <item.icon className="w-5 h-5 text-gray-500" />
                                                {t(item.labelKey)}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </nav>

                            {/* Mobile Footer Actions (Settings) */}
                            <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-4 shrink-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('theme')}</span>
                                    <ThemeSelector />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('notifications')}</span>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false); // Close menu first
                                            setIsNotificationOpen(true); // Open notifications
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

                <Link href="/" className="flex items-center gap-2 md:hidden">
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
                </Link>

                <div className="hidden md:flex flex-1"></div>
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-4">

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Theme Selector (Visible on all screens) */}
                <div>
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
                    onClick={() => {
                        setIsNotificationOpen(!isNotificationOpen);
                    }}
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
