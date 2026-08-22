'use client'

import React from 'react'
import { ArrowRight, Bot, Database, BarChart3, ShieldCheck, Cpu, Code2, Sparkles, Network } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function BusinessPage() {
    const { t, language } = useLanguage()

    return (
        <div className="flex flex-col bg-gray-50 dark:bg-black transition-colors min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-950 via-zinc-900 to-emerald-950 text-white py-24 px-6 border-b border-emerald-900/30 relative overflow-hidden">
                {/* Background decorative glow */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                {language === 'bn' ? 'কারিগরি অংশীদারিত্ব ও গবেষণা' : 'Civic Tech & Data Engineering'}
                            </div>
                            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight ${language === 'bn' ? 'font-bengali' : ''}`}>
                                {t('business_hero_title')}
                            </h1>
                            <p className={`text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl ${language === 'bn' ? 'font-bengali' : ''}`}>
                                {t('business_hero_desc')}
                            </p>
                            <div className="pt-2">
                                <a
                                    href="https://wa.me/8801924572887"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/40 hover:scale-[1.02]"
                                >
                                    {t('contact_consultation')} <ArrowRight className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-sm">
                            <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/20 shadow-2xl space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <Bot className="w-6 h-6 text-emerald-400" />
                                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">AI Intelligence</span>
                                    </div>
                                    <span className="flex h-2.5 w-2.5 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-3/4 bg-zinc-800 rounded"></div>
                                    <div className="h-2 w-1/2 bg-zinc-800 rounded"></div>
                                </div>
                                <div className="h-32 w-full bg-emerald-950/40 rounded-xl flex flex-col items-center justify-center border border-dashed border-emerald-500/30 p-4 text-center">
                                    <Network className="w-8 h-8 text-emerald-400 mb-2" />
                                    <span className="text-xs font-mono text-emerald-300">
                                        {language === 'bn' ? 'স্বয়ংক্রিয় ফরেনসিক এআই মডেল সক্রিয়' : 'Automated Forensic AI Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className={`text-3xl font-bold text-zinc-900 dark:text-white mb-4 ${language === 'bn' ? 'font-bengali' : ''}`}>
                            {t('what_we_build')}
                        </h2>
                        <p className={`text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto ${language === 'bn' ? 'font-bengali' : ''}`}>
                            {t('services_desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Service 1 */}
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 transition-all hover:shadow-xl group">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                <Database className="w-6 h-6" />
                            </div>
                            <h3 className={`text-xl font-bold text-zinc-900 dark:text-white mb-3 ${language === 'bn' ? 'font-bengali' : ''}`}>
                                {t('custom_scrapers')}
                            </h3>
                            <p className={`text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm ${language === 'bn' ? 'font-bengali' : ''}`}>
                                {t('scrapers_desc')}
                            </p>
                        </div>

                        {/* Service 2 */}
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-teal-500/50 transition-all hover:shadow-xl group">
                            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/40 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <h3 className={`text-xl font-bold text-zinc-900 dark:text-white mb-3 ${language === 'bn' ? 'font-bengali' : ''}`}>
                                {t('ai_nlp_tools')}
                            </h3>
                            <p className={`text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm ${language === 'bn' ? 'font-bengali' : ''}`}>
                                {t('ai_desc')}
                            </p>
                        </div>

                        {/* Service 3 */}
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 transition-all hover:shadow-xl group">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h3 className={`text-xl font-bold text-zinc-900 dark:text-white mb-3 ${language === 'bn' ? 'font-bengali' : ''}`}>
                                {t('analytics_dashboards')}
                            </h3>
                            <p className={`text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm ${language === 'bn' ? 'font-bengali' : ''}`}>
                                {t('dashboards_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="bg-zinc-100 dark:bg-zinc-900/50 py-16 px-6 border-y border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto max-w-4xl text-center">
                    <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-8">
                        {t('tech_stack')}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-6 md:gap-10 opacity-80">
                        {['Next.js 16', 'TypeScript', 'Prisma ORM', 'PostgreSQL / Neon', 'Python', 'Docker', 'OpenRouter AI'].map((tech) => (
                            <span key={tech} className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200 shadow-sm">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-3xl text-center space-y-6">
                    <h2 className={`text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                        {t('ready_to_build')}
                    </h2>
                    <p className={`text-base sm:text-lg text-zinc-600 dark:text-zinc-400 ${language === 'bn' ? 'font-bengali' : ''}`}>
                        {t('build_desc')}
                    </p>
                    <div className="pt-4">
                        <a
                            href="https://wa.me/8801924572887"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg hover:scale-105"
                        >
                            {t('talk_to_expert')} <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
