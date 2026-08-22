'use client'

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Database, Search, Users, ExternalLink, Globe } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export default function AboutClient() {
    const { t, language } = useLanguage()

    return (
        <div className={`container mx-auto px-4 py-8 max-w-4xl ${language === 'bn' ? 'font-bengali' : ''}`}>
            {/* Header Section */}
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-900 dark:from-red-400 dark:to-red-600 bg-clip-text text-transparent">
                    {t('about_page_title')}
                </h1>
                <p className="text-xl text-muted-foreground dark:text-gray-200">
                    {t('about_page_subtitle')}
                </p>
                <Separator className="my-6 bg-border dark:bg-slate-700" />
                <p className="text-lg text-muted-foreground dark:text-gray-200 leading-relaxed max-w-2xl mx-auto">
                    {t('about_intro_text')}
                </p>
            </div>

            {/* Who We Are Section */}
            <section className="mb-16">
                <div className="bg-card dark:bg-slate-900/50 rounded-xl p-8 border dark:border-slate-800 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 dark:text-white">
                        <Users className="h-6 w-6 text-primary dark:text-red-500" />
                        {t('our_identity_title')}
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground dark:text-gray-200 mb-8">
                        {t('our_identity_desc')}
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                        {/* Member 1: Sadiq M Alam */}
                        <div className="flex flex-col items-center text-center p-6 bg-background dark:bg-slate-800 rounded-lg border border-transparent dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-32 h-32 rounded-full bg-slate-200 mb-4 overflow-hidden border-4 border-primary/10">
                                <img
                                    src="/images/sadiq_circular.png"
                                    alt="Sadiq M Alam"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Sadiq+M+Alam&background=random&size=128"
                                    }}
                                />
                            </div>
                            <h3 className="text-xl font-bold dark:text-white">
                                <a href="https://sadiqalam.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-red-600 dark:hover:text-red-400">
                                    {t('sadiq_name')}
                                </a>
                            </h3>
                            <p className="text-sm font-medium text-primary dark:text-blue-400">{t('founder_role')}</p>
                        </div>

                        {/* Member 2: Musfiqur Tuhin */}
                        <div className="flex flex-col items-center text-center p-6 bg-background dark:bg-slate-800 rounded-lg border border-transparent dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-32 h-32 rounded-full bg-slate-200 mb-4 overflow-hidden border-4 border-primary/10">
                                <img
                                    src="/images/tuhin.jpg"
                                    alt="Musfiqur Tuhin"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Musfiqur+Tuhin&background=random&size=128"
                                    }}
                                />
                            </div>
                            <h3 className="text-xl font-bold dark:text-white">
                                <a href="https://musfiqurtuhin.me" target="_blank" rel="noopener noreferrer" className="transition-colors">
                                    {t('tuhin_name_display')}
                                </a>
                            </h3>
                            <p className="text-sm font-medium text-primary dark:text-blue-400">{t('cofounder_role')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What is Violence Tracker */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 dark:text-white">
                    <ShieldCheck className="h-6 w-6 text-primary dark:text-red-500" />
                    {t('what_is_vt_title')}
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground dark:text-gray-200 leading-relaxed">
                    <p>
                        {t('what_is_vt_desc')}
                    </p>

                    <h3 className="text-xl font-semibold text-foreground dark:text-white mt-8 mb-4">{t('how_it_works_title')}</h3>
                    <p className="mb-4">{t('how_it_works_desc')}</p>

                    <div className="grid md:grid-cols-3 gap-4">
                        <Card className="p-6 bg-background/50 dark:bg-slate-800/50 dark:border-slate-700">
                            <div className="font-bold text-primary dark:text-blue-400 text-xl mb-2">{t('step_1_title')}</div>
                            <p className="text-sm dark:text-gray-300">
                                {t('step_1_desc')}
                            </p>
                        </Card>
                        <Card className="p-6 bg-background/50 dark:bg-slate-800/50 dark:border-slate-700">
                            <div className="font-bold text-primary dark:text-blue-400 text-xl mb-2">{t('step_2_title')}</div>
                            <p className="text-sm dark:text-gray-300">
                                {t('step_2_desc')}
                            </p>
                        </Card>
                        <Card className="p-6 bg-background/50 dark:bg-slate-800/50 dark:border-slate-700">
                            <div className="font-bold text-primary dark:text-blue-400 text-xl mb-2">{t('step_3_title')}</div>
                            <p className="text-sm dark:text-gray-300">
                                {t('step_3_desc_pre_bold')} <strong className="text-foreground dark:text-white">{t('step_3_bold')}</strong>{t('step_3_desc_post_bold')}
                            </p>
                        </Card>
                    </div>

                    <p className="italic text-base bg-yellow-500/10 dark:bg-yellow-900/20 p-4 rounded-md border-l-4 border-yellow-500 mt-6 dark:text-gray-100">
                        {t('automated_quote')}
                    </p>
                </div>
            </section>

            {/* Use Cases */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 dark:text-white">
                    <Database className="h-6 w-6 text-primary dark:text-red-500" />
                    {t('use_cases_title')}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex gap-4 items-start p-4 rounded-lg bg-card dark:bg-slate-900 border dark:border-slate-800">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                            <Search className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1 dark:text-white">{t('researcher_title')}</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                {t('researcher_desc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-lg bg-card dark:bg-slate-900 border dark:border-slate-800">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1 dark:text-white">{t('political_party_title')}</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                {t('political_party_desc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-lg bg-card dark:bg-slate-900 border dark:border-slate-800">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600 dark:text-purple-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1 dark:text-white">{t('human_rights_title')}</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                {t('human_rights_desc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-lg bg-card dark:bg-slate-900 border dark:border-slate-800">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400">
                            <ExternalLink className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1 dark:text-white">{t('law_enforcement_title')}</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                {t('law_enforcement_desc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-lg bg-card dark:bg-slate-900 border dark:border-slate-800 md:col-span-2">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full text-orange-600 dark:text-orange-400">
                            <Globe className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1 dark:text-white">{t('general_public_title')}</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                {t('general_public_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Citation Policy */}
            <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-xl text-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-2 dark:text-white">{t('data_terms_title')}</h3>
                <p className="text-muted-foreground dark:text-gray-300 mb-4">
                    {t('data_terms_desc')}
                </p>
                <div className="inline-flex items-center gap-2 bg-white dark:bg-black px-4 py-2 rounded-md shadow-sm text-sm border dark:border-slate-800 font-mono">
                    <span className="dark:text-gray-400">Source:</span>
                    <a href="https://violencetracker.org" className="text-blue-600 dark:text-blue-400 hover:underline">
                        violencetracker.org
                    </a>
                </div>
            </div>
        </div>
    )
}
