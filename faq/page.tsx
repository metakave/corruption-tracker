'use client'

import React from 'react'
import { HelpCircle, ChevronDown, ChevronUp, Bot, Database, Globe, Shield } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useState } from 'react'

export default function FAQPage() {
    const { t, language } = useLanguage()
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = [
        // Category 1: General
        { category: 'faq_cat_general', icon: HelpCircle },
        { q: 'faq_q1', a: 'faq_a1' },
        { q: 'faq_q2', a: 'faq_a2' },
        { q: 'faq_q3', a: 'faq_a3' },
        { q: 'faq_q4', a: 'faq_a4' },

        // Category 2: Technology
        { category: 'faq_cat_tech', icon: Bot },
        { q: 'faq_q5', a: 'faq_a5' },
        { q: 'faq_q6', a: 'faq_a6' },

        { q: 'faq_q8', a: 'faq_a8' },
        { q: 'faq_q9', a: 'faq_a9' },

        // Category 3: Access
        { category: 'faq_cat_access', icon: Shield },
        { q: 'faq_q10', a: 'faq_a10' },
        { q: 'faq_q11', a: 'faq_a11' },
        { q: 'faq_q12', a: 'faq_a12' },
    ]

    return (
        <div className="flex flex-col bg-gray-50 dark:bg-black transition-colors">
            {/* Header Section */}
            <section className="bg-slate-900 text-white py-16 px-6">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('faq_title')}</h1>
                    <p className="text-gray-400 text-lg">{t('faq_desc')}</p>
                </div>
            </section>

            {/* FAQ List Section */}
            <section className="py-12 px-6">
                <div className="container mx-auto max-w-3xl">
                    <div className="space-y-4">
                        {faqs.map((item, index) => {
                            if ('category' in item) {
                                return (
                                    <div key={item.category} className="pt-8 pb-4">
                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-sm border-b border-gray-200 dark:border-slate-800 pb-2 mb-4">
                                            {item.icon && <item.icon className="w-4 h-4" />}
                                            {t(item.category!)}
                                        </div>
                                    </div>
                                )
                            }

                            const isOpen = openIndex === index
                            return (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-all shadow-sm hover:shadow-md"
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50"
                                    >
                                        <span className={`font-semibold text-gray-900 dark:text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                                            {t(item.q as string)}
                                        </span>
                                        {isOpen ? (
                                            <ChevronUp className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                    </button>

                                    {isOpen && (
                                        <div className="p-5 pt-0 border-t border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${language === 'bn' ? 'font-bengali' : ''}`}>
                                                {t(item.a as string)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Support CTA */}
            <section className="py-16 px-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                <div className="container mx-auto max-w-2xl text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('ready_to_build')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">{t('build_desc')}</p>
                    <a
                        href="https://wa.me/8801924572887"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-indigo-500/30 inline-block"
                    >
                        {t('talk_to_expert')}
                    </a>
                </div>
            </section>
        </div>
    )
}
