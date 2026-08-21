'use client'

import { useLanguage } from '@/context/LanguageContext'

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage()

    return (
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
            <button
                onClick={() => setLanguage('bn')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${language === 'bn'
                    ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
            >
                <span className="md:hidden">BN</span>
                <span className="hidden md:inline">{t('lang_bangla')}</span>
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
            >
                <span className="md:hidden">EN</span>
                <span className="hidden md:inline">{t('lang_english')}</span>
            </button>
        </div>
    )
}
