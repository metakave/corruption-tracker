'use client'

import React, { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, Bot, Shield, ArrowRight, MessageCircleQuestion } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

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
        <div className="flex flex-col bg-gray-50 dark:bg-black transition-colors min-h-screen">
            {/* Header Section */}
            <section className="bg-gradient-to-br from-slate-950 via-zinc-900 to-emerald-950 text-white py-20 px-6 border-b border-emerald-900/30 text-center relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="container mx-auto max-w-4xl relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <MessageCircleQuestion className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'সরাসরি প্রশ্নোত্তর ও সহায়িকা' : 'Help & Documentation'}
                    </div>
                    <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${language === 'bn' ? 'font-bengali' : ''}`}>
                        {t('faq_title')}
                    </h1>
                    <p className={`text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${language === 'bn' ? 'font-bengali' : ''}`}>
                        {t('faq_desc')}
                    </p>
                </div>
            </section>

            {/* FAQ List Section */}
            <section className="py-16 px-6">
                <div className="container mx-auto max-w-3xl">
                    <div className="space-y-4">
                        {faqs.map((item, index) => {
                            if ('category' in item) {
                                const CategoryIcon = item.icon
                                return (
                                    <div key={item.category} className="pt-8 pb-2">
                                        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-3">
                                            {CategoryIcon && <CategoryIcon className="w-4 h-4" />}
                                            <span>{t(item.category!)}</span>
                                        </div>
                                    </div>
                                )
                            }

                            const isOpen = openIndex === index
                            return (
                                <div
                                    key={index}
                                    className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all shadow-sm ${
                                        isOpen 
                                            ? 'border-emerald-500/50 dark:border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20' 
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                    }`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-2xl"
                                    >
                                        <span className={`font-semibold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg ${language === 'bn' ? 'font-bengali' : ''}`}>
                                            {t(item.q as string)}
                                        </span>
                                        {isOpen ? (
                                            <ChevronUp className="w-5 h-5 text-emerald-500 shrink-0 ml-4" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0 ml-4" />
                                        )}
                                    </button>

                                    {isOpen && (
                                        <div className="px-5 pb-5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <p className={`text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base ${language === 'bn' ? 'font-bengali' : ''}`}>
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
            <section className="py-16 px-6 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto max-w-2xl text-center space-y-4">
                    <h3 className={`text-2xl font-bold text-zinc-900 dark:text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                        {t('ready_to_build')}
                    </h3>
                    <p className={`text-zinc-600 dark:text-zinc-400 text-sm sm:text-base ${language === 'bn' ? 'font-bengali' : ''}`}>
                        {t('build_desc')}
                    </p>
                    <div className="pt-2">
                        <a
                            href="https://wa.me/8801924572887"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 hover:scale-105"
                        >
                            {t('talk_to_expert')} <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
