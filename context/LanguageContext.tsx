'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'bn' | 'en'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const translations: Record<string, Record<Language, string>> = {
    // Branding
    'app_name': { bn: 'দুর্নীতি ট্র্যাকার', en: 'Corruption Tracker' },
    'app_name_corruption': { bn: 'দুর্নীতি', en: 'Corruption' },
    'app_name_tracker': { bn: 'ট্র্যাকার', en: 'Tracker' },
    'welcome_title': { bn: 'বাংলাদেশ দুর্নীতি পর্যবেক্ষণ ও বিশ্লেষণ', en: 'Bangladesh Corruption Monitoring & Analytics' },
    'welcome_desc': { 
        bn: 'বাংলাদেশের জাতীয় গণমাধ্যমে প্রকাশিত সরকারি ও বেসরকারি খাতের দুর্নীতি, অর্থ আত্মসাৎ, অর্থপাচার, টেন্ডার কারচুপি ও ঋণ কেলেঙ্কারির সার্বক্ষণিক ও স্বয়ংক্রিয় তথ্যভান্ডার।', 
        en: 'A continuous, automated, data-driven intelligence platform tracking public and private sector corruption, embezzlement, money laundering, tender fraud, and loan scams across Bangladesh.' 
    },

    // Navigation
    'dashboard': { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
    'analytics': { bn: 'পরিসংখ্যান ও খাত', en: 'Sectors & Analytics' },
    'data_table': { bn: 'দুর্নীতি ডাটা টেবিল', en: 'Corruption Records' },
    'live_feed': { bn: 'সর্বশেষ সংবাদ', en: 'Latest News' },
    'about': { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
    'faq': { bn: 'সাধারণ জিজ্ঞাসা', en: 'FAQ' },
    'map': { bn: 'জেলা ম্যাপ', en: 'District Map' },

    // Status & Counters
    'crawler_active': { bn: 'ক্রলার সক্রিয়', en: 'Crawler Active' },
    'ai_engine': { bn: 'এআই বিশ্লেষণ ইঞ্জিন', en: 'AI Corruption Engine' },
    'total_incidents': { bn: 'মোট দুর্নীতির ঘটনা', en: 'Total Corruption Cases' },
    'total_loss': { bn: 'মোট আর্থিক ক্ষতি (আনুমানিক)', en: 'Total Estimated Loss' },
    'today_incidents': { bn: 'আজকের প্রকাশিত ঘটনা', en: "Today's Reported Cases" },
    'largest_scam': { bn: 'বৃহত্তম আর্থিক কেলেঙ্কারি', en: 'Largest Tracked Scam' },
    'top_sector': { bn: 'সর্বাধিক আলোচিত খাত', en: 'Top Affected Sector' },
    'view_archive': { bn: 'সম্পূর্ণ তালিকা দেখুন →', en: 'View All Records →' },
    'crores_bdt': { bn: 'কোটি টাকা', en: 'Crore BDT' },

    // Categories
    'cat_embezzlement': { bn: 'তহবিল আত্মসাৎ', en: 'Embezzlement' },
    'cat_bribery': { bn: 'ঘুষ লেনদেন', en: 'Bribery' },
    'cat_money_laundering': { bn: 'অর্থপাচার ও হুন্ডি', en: 'Money Laundering' },
    'cat_tender_fraud': { bn: 'টেন্ডার কারচুপি', en: 'Tender Fraud' },
    'cat_loan_scam': { bn: 'ব্যাংক ঋণ কেলেঙ্কারি', en: 'Bank Loan Scam' },
    'cat_illegal_wealth': { bn: 'অবৈধ সম্পদ অর্জন', en: 'Illegal Wealth' },
    'cat_power_abuse': { bn: 'ক্ষমতার অপব্যবহার', en: 'Abuse of Power' },
    'cat_land_grabbing': { bn: 'ভূমি দখল ও জালিয়াতি', en: 'Land Grabbing' },

    // Search & Filters
    'search_placeholder': { bn: 'অভিযুক্ত, মন্ত্রণালয় বা ঘটনা খুঁজুন...', en: 'Search accused, ministry, or scam...' },
    'filter_sector': { bn: 'খাত / মন্ত্রণালয়', en: 'Sector / Ministry' },
    'filter_category': { bn: 'দুর্নীতির ধরন', en: 'Corruption Type' },
    'filter_status': { bn: 'আইনি অবস্থা', en: 'Legal Status' },
    'filter_district': { bn: 'জেলা নির্বাচন', en: 'Select District' },
    'download_data': { bn: 'ডাটা ডাউনলোড', en: 'Download Data' },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('bn')

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language
        if (saved === 'bn' || saved === 'en') {
            setLanguage(saved)
        }
    }, [])

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem('language', lang)
    }

    const t = (key: string): string => {
        return translations[key]?.[language] || translations[key]?.['en'] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
