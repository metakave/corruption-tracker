'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import {
    Database,
    Cpu,
    Globe,
    Zap,
    ShieldCheck,
    Clock
} from 'lucide-react'

const Footer = () => {
    const pathname = usePathname()
    const { t } = useLanguage()

    if (pathname === '/map') return null
    const [lastRunTime, setLastRunTime] = React.useState<string | null>(null)

    React.useEffect(() => {
        fetch('/api/scraper-stats')
            .then(res => res.json())
            .then(data => {
                if (data?.lastRun?.timestamp) {
                    const date = new Date(data.lastRun.timestamp)
                    setLastRunTime(date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'Asia/Dhaka'
                    }) + ' BD')
                }
            })
            .catch(console.error)
    }, [])

    const techItems = [
        {
            icon: <Cpu className="w-5 h-5 text-blue-500" />,
            title: t('footer_engine'),
            desc: t('footer_engine_desc'),
        },
        {
            icon: <Globe className="w-5 h-5 text-emerald-500" />,
            title: t('footer_scraping'),
            desc: t('footer_scraping_desc'),
        },
        {
            icon: <Zap className="w-5 h-5 text-amber-500" />,
            title: t('footer_automation'),
            desc: t('footer_automation_desc'),
        },
        {
            icon: <Database className="w-5 h-5 text-indigo-500" />,
            title: t('footer_bilingual_title'),
            desc: t('footer_bilingual_desc'),
        }
    ]

    return (
        <footer className="w-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-900 dark:to-slate-800 border-t border-gray-200 dark:border-gray-800 pt-16 pb-12 px-6 mt-32 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-10 border-b border-gray-100 dark:border-gray-900">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                            {t('footer_engineering')}
                        </h2>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2 italic max-w-xl">
                            {t('footer_built_with')}
                        </p>
                    </div>

                    <div className="mt-8 md:mt-0 flex flex-wrap gap-4 md:gap-8">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 shadow-sm transition-all hover:shadow-md hover:scale-105">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tracking-tight">
                                {t('footer_status_online')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 shadow-sm transition-all hover:shadow-md hover:scale-105">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400 tracking-tight">
                                {t('footer_last_run')}: {lastRunTime || 'Loading...'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {techItems.map((item, idx) => (
                        <div key={idx} className="group p-6 rounded-3xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-900 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
                            <div className="mb-5 p-3 w-fit rounded-2xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all duration-300">
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-500 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} {t('app_name')}. {t('footer_rights')} {t('footer_credit_pre')} <a href="https://deltaflowlab.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{t('footer_credit_link')}</a> {t('footer_credit_post')}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                        <span>AI POWERED</span>
                        <span className="text-gray-300 dark:text-gray-800">|</span>
                        <span>NEXT.JS</span>
                        <span className="text-gray-300 dark:text-gray-800">|</span>
                        <span>OPEN DATA</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
