'use client'

import React from 'react'
import { ArrowRight, Bot, Database, BarChart3, ShieldCheck, Cpu } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function BusinessPage() {
    const { t } = useLanguage()

    return (
        <div className="flex flex-col bg-gray-50 dark:bg-black transition-colors">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white py-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                {t('business_hero_title')}
                            </h1>
                            <p className="text-lg text-gray-300 leading-relaxed max-w-xl">
                                {t('business_hero_desc')}
                            </p>
                            <a
                                href="https://wa.me/8801924572887"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/30"
                            >
                                {t('contact_consultation')} <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                        <div className="flex-1 w-full max-w-sm">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                                <Bot className="w-16 h-16 text-blue-400 mb-4" />
                                <div className="space-y-4">
                                    <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                                    <div className="h-2 w-1/2 bg-white/20 rounded"></div>
                                    <div className="h-32 w-full bg-blue-500/20 rounded-lg flex items-center justify-center border border-dashed border-blue-400/50">
                                        <span className="text-sm font-mono text-blue-300">{t('ai_engine')} Logic...</span>
                                    </div>
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
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('what_we_build')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            {t('services_desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Service 1 */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 hover:border-blue-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                <Database className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('custom_scrapers')}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t('scrapers_desc')}
                            </p>
                        </div>

                        {/* Service 2 */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 hover:border-purple-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('ai_nlp_tools')}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t('ai_desc')}
                            </p>
                        </div>

                        {/* Service 3 */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 hover:border-green-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('analytics_dashboards')}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t('dashboards_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="bg-gray-100 dark:bg-slate-900/50 py-16 px-6 border-y border-gray-200 dark:border-slate-800">
                <div className="container mx-auto max-w-4xl text-center">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-8">{t('tech_stack')}</h3>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all">
                        {['Next.js', 'Python', 'TensorFlow', 'PostgreSQL', 'Docker', 'AWS'].map((tech) => (
                            <span key={tech} className="text-xl font-bold text-gray-800 dark:text-gray-300">{tech}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">{t('ready_to_build')}</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
                        {t('build_desc')}
                    </p>
                    <a
                        href="https://wa.me/8801924572887"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
                    >
                        {t('talk_to_expert')} <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>
        </div>
    )
}
