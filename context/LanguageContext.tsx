'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'bn' | 'en'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

export const translations: Record<string, Record<Language, string>> = {
    // Branding & Identity
    'app_name': { bn: 'বাংলাদেশ দুর্নীতি ট্র্যাকার', en: 'Bangladesh Corruption Tracker' },
    'app_name_violence': { bn: 'দুর্নীতি', en: 'Corruption' },
    'app_name_corruption': { bn: 'দুর্নীতি', en: 'Corruption' },
    'app_name_tracker': { bn: 'ট্র্যাকার', en: 'Tracker' },
    'app_site_title': { 
        bn: 'বাংলাদেশ দুর্নীতি ট্র্যাকার | আর্থিক অনিয়ম ও দুর্নীতির রিয়েল-টাইম তথ্যভান্ডার', 
        en: 'Bangladesh Corruption Tracker | Real-Time Financial Crime & Graft Intelligence' 
    },
    'welcome_title': { bn: 'বাংলাদেশ দুর্নীতি ও আর্থিক অপরাধ পর্যবেক্ষণ', en: 'Bangladesh Corruption & Financial Crime Intelligence' },
    'welcome_desc': { 
        bn: 'বাংলাদেশের জাতীয় গণমাধ্যমে প্রকাশিত দুর্নীতি, অর্থপাচার, ঋণ কেলেঙ্কারি ও আর্থিক অনিয়মের সার্বক্ষণিক ও স্বয়ংক্রিয় এআই তথ্যভান্ডার।', 
        en: 'A continuous, automated, AI-driven intelligence platform tracking documented graft, financial crimes, and money laundering across Bangladesh.' 
    },

    // Language & System UI
    'lang_bangla': { bn: 'বাংলা', en: 'বাংলা' },
    'lang_english': { bn: 'English', en: 'English' },
    'theme': { bn: 'থিম', en: 'Theme' },
    'notifications': { bn: 'বিজ্ঞপ্তি', en: 'Notifications' },
    'live': { bn: 'লাইভ', en: 'LIVE' },
    'tracking_sources': { bn: 'মিডিয়া উৎস ট্র্যাকিং', en: 'Tracking Media Sources' },
    'crawler_active': { bn: 'ক্রলার সক্রিয়', en: 'Crawler Active' },
    'crawler_ai_active': { bn: 'ক্রলার ও এআই সক্রিয়', en: 'Crawler & AI Active' },
    'sidebar_version': { bn: 'সংস্করণ ১.০ (লাইভ ট্র্যাকার)', en: 'Version 1.0 (Live Tracker)' },
    'ai_engine': { bn: 'এআই বিশ্লেষণ ইঞ্জিন', en: 'AI Analysis Engine' },
    'loading': { bn: 'লোড হচ্ছে...', en: 'Loading...' },
    'none_recorded': { bn: 'কোনো তথ্য নেই', en: 'None recorded' },
    'no_incidents': { bn: 'কোনো ঘটনা পাওয়া যায়নি', en: 'No incidents found' },
    'recent_incidents': { bn: 'সাম্প্রতিক দুর্নীতির ঘটনাবলী', en: 'Recent Corruption Incidents' },
    'latest_reports': { bn: 'তাজা সংবাদ ও প্রতিবেদন', en: 'Latest reports from monitored media' },
    'live_incident_map': { bn: 'লাইভ দুর্নীতির মানচিত্র', en: 'Live Corruption Incident Map' },
    'live_updates': { bn: 'সার্বক্ষণিক আপডেট', en: 'Live updates' },
    'deadliest_7days': { bn: 'গত ৭ দিনের সর্বাধিক আলোচিত', en: 'Top Highlighted in 7 Days' },
    'killed': { bn: 'জন নিহত', en: 'killed' },
    'high_risk_zone': { bn: 'সর্বাধিক দুর্নীতি প্রবণ জেলা', en: 'High Corruption Zone' },
    'incidents_7d': { bn: 'টি ঘটনা (গত ৭ দিন)', en: 'incidents (last 7d)' },
    'map_popup_district_title': { bn: 'টি ঘটনা এই জেলায়', en: 'incidents in this district' },
    'click_to_see_categories': { bn: 'ক্যাটেগরি দেখতে ক্লিক করুন', en: 'Click to view categories' },
    'back_to_insights': { bn: '← ইনসাইটসে ফিরে যান', en: '← Back to Insights' },

    // Navigation
    'dashboard': { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
    'analytics': { bn: 'পরিসংখ্যান ও বিশ্লেষণ', en: 'Analytics & Trends' },
    'data_table': { bn: 'ডাটা টেবিল', en: 'Data Records' },
    'live_feed': { bn: 'লাইভ ফিড', en: 'Live Feed' },
    'insights': { bn: 'ইনসাইটস ও রিপোর্ট', en: 'Insights & Reports' },
    'monthly_report': { bn: 'মাসিক প্রতিবেদন', en: 'Monthly Reports' },
    'report_summary': { bn: 'নির্বাহী সারসংক্ষেপ', en: 'Executive Summary' },
    'report_full': { bn: 'পূর্ণাঙ্গ প্রতিবেদন', en: 'Full Report' },
    'category_political_violence': { bn: 'রাজনৈতিক সহিংসতা', en: 'Political Violence' },
    'category_mob_justice': { bn: 'মব জাস্টিস ও গণপিটুনি', en: 'Mob Violence & Lynching' },
    'category_communal_violence': { bn: 'সাম্প্রদায়িক সহিংসতা', en: 'Communal Violence' },
    'category_gender_based_violence': { bn: 'জেন্ডার-ভিত্তিক সহিংসতা', en: 'Gender-Based Violence' },
    'category_criminal_violence': { bn: 'অপরাধমূলক সহিংসতা', en: 'Criminal Violence' },
    'video_insights': { bn: 'ভিডিও ইনসাইটস ও বিশ্লেষণ', en: 'Video Insights & Analysis' },
    'history_political_violence': { bn: 'সহিংসতার ইতিহাস ও পর্যালোচনা', en: 'History of Political Violence' },
    'south_asia_election_violence': { bn: 'দক্ষিণ এশিয়ার নির্বাচন সহিংসতা', en: 'South Asia Election Violence' },
    'about': { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
    'faq': { bn: 'সাধারণ জিজ্ঞাসা', en: 'FAQ' },
    'map': { bn: 'মানচিত্র', en: 'Map' },
    'business': { bn: 'কারিগরি সহযোগিতা', en: 'Technical Collaboration' },
    'technical_collaboration': { bn: 'কারিগরি সহযোগিতা', en: 'Technical Collaboration' },
    'download_data': { bn: 'ডাটা ডাউনলোড', en: 'Download Data' },

    // Status & Dashboard Counters
    'total_incidents': { bn: 'মোট নথিভুক্ত ঘটনা', en: 'Total Documented Cases' },
    'total_loss': { bn: 'মোট আর্থিক ক্ষতি (আনুমানিক)', en: 'Total Estimated Loss' },
    'today_incidents': { bn: 'আজকের প্রকাশিত ঘটনা', en: "Today's Reported Cases" },
    'largest_scam': { bn: 'বৃহত্তম আর্থিক কেলেঙ্কারি', en: 'Largest Tracked Scam' },
    'top_sector': { bn: 'সর্বাধিক আলোচিত খাত', en: 'Top Affected Sector' },
    'view_archive': { bn: 'সম্পূর্ণ তালিকা দেখুন →', en: 'View All Records →' },
    'crores_bdt': { bn: 'কোটি টাকা', en: 'Crore BDT' },
    'hotspot_district': { bn: 'সর্বাধিক ঘটনা প্রবণ জেলা', en: 'Highest Incident District' },
    'under_investigation': { bn: 'টি তদন্তাধীন ঘটনা', en: 'cases under investigation' },
    'reports_count': { bn: 'টি রিপোর্ট', en: 'reports' },
    'cases_count': { bn: 'টি ঘটনা', en: 'cases' },
    'view_large_map': { bn: 'বড় ম্যাপ দেখুন →', en: 'View Full Map →' },
    'map_district_spread': { bn: 'জেলাভিত্তিক ঘটনার বিস্তার', en: 'District-wise Distribution' },
    'sector_breakdown_title': { bn: 'খাতভিত্তিক অনিয়ম ও ক্ষতি', en: 'Sectoral Breakdown & Loss' },
    'view_full_database': { bn: 'সম্পূর্ণ ডাটাবেজ দেখুন', en: 'View Complete Database' },
    'crores_unit': { bn: 'কোটি', en: 'Crore' },

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
    'search_placeholder': { bn: 'অনুসন্ধান করুন...', en: 'Search records, keywords...' },
    'filter_sector': { bn: 'খাত / মন্ত্রণালয়', en: 'Sector / Ministry' },
    'filter_category': { bn: 'ক্যাটেগরি', en: 'Category' },
    'filter_status': { bn: 'আইনি অবস্থা', en: 'Legal Status' },
    'filter_district': { bn: 'জেলা নির্বাচন', en: 'Select District' },

    // Reports & Analytics
    'reports_section_title': { bn: 'বিশেষ বিশ্লেষণ ও প্রতিবেদন', en: 'Special Research & Reports' },
    'jan_2026_full_title': { bn: 'জানুয়ারি ২০২৬ দুর্নীতি পর্যবেক্ষণ প্রতিবেদন (পূর্ণাঙ্গ)', en: 'January 2026 Corruption Monitoring Report (Full)' },
    'jan_2026_full_desc': { bn: 'জানুয়ারি মাসের সকল আর্থিক অনিয়ম, অর্থপাচার ও দুর্নীতির পূর্ণাঙ্গ তথ্যচিত্র ও খাতভিত্তিক পরিসংখ্যান।', en: 'Comprehensive data-driven breakdown of graft, embezzlement, and financial crimes in January.' },
    'read_report': { bn: 'প্রতিবেদনটি পড়ুন', en: 'Read Report' },
    'jan_2026_summary_title': { bn: 'জানুয়ারি ২০২৬ নির্বাহী সারসংক্ষেপ', en: 'January 2026 Executive Summary' },
    'jan_2026_summary_desc': { bn: 'নীতি-নির্ধারক ও গবেষকদের জন্য জানুয়ারি ২০২৬-এর প্রধান দুর্নীতি পর্যবেক্ষণ ও তাৎক্ষণিক সারসংক্ষেপ।', en: 'Key takeaways, policy highlights, and high-level summaries of January 2026 graft incidents.' },

    // About Us Page
    'about_page_title': { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
    'about_page_subtitle': { bn: 'উন্মুক্ত তথ্য ও এআই প্রযুক্তির মাধ্যমে আর্থিক স্বচ্ছতা ও জবাবদিহিতা নিশ্চিতকরণ', en: 'Ensuring Financial Transparency & Public Accountability through Open Data and AI Technology' },
    'about_intro_text': { bn: 'বাংলাদেশ দুর্নীতি ট্র্যাকার একটি স্বাধীন, অরাজনৈতিক ও উন্মুক্ত ডাটা প্ল্যাটফর্ম। কৃত্রিম বুদ্ধিমত্তা ও গণমাধ্যম ক্রলিংয়ের মাধ্যমে আমরা জাতীয় দুর্নীতির ঘটনাবলীকে নিরপেক্ষভাবে সংরক্ষণ ও বিশ্লেষণ করি।', en: 'Bangladesh Corruption Tracker is an independent, non-partisan, open-data intelligence platform that neutrally archives and analyzes national financial crimes and graft using AI and real-time news scraping.' },
    'our_identity_title': { bn: 'আমরা কারা', en: 'Who We Are' },
    'our_identity_desc': { bn: 'আমরা একদল গবেষক, ডেটা প্রকৌশলী ও সুশাসন কর্মী, যারা প্রযুক্তির সহায়তায় আর্থিক তথ্যের স্বচ্ছতা ও সার্বজনীন প্রবেশাধিকার নিশ্চিত করতে অঙ্গীকারবদ্ধ।', en: 'We are a dedicated team of researchers, software engineers, and anti-corruption data advocates committed to financial transparency and universal open access.' },
    'tuhin_name_display': { bn: 'মুশফিকুর তুহিন', en: 'Musfiqur Tuhin' },
    'founder_role': { bn: 'প্রতিষ্ঠাতা ও হেড অব আইডিয়াজ', en: 'Founder & Head of Ideas' },
    'sadiq_name': { bn: 'সাদিক এম আলম', en: 'Sadiq M Alam' },
    'cofounder_role': { bn: 'সহ-প্রতিষ্ঠাতা ও প্রধান প্রকৌশলী', en: 'Co-Founder & Lead Engineer' },
    'what_is_vt_title': { bn: 'প্ল্যাটফর্মের মূল উদ্দেশ্য কী?', en: 'What is This Platform?' },
    'what_is_vt_desc': { bn: 'বাংলাদেশের নির্ভরযোগ্য মূলধারার গণমাধ্যমে প্রকাশিত দুর্নীতি ও আর্থিক অপরাধের সংবাদসমূহ স্বয়ংক্রিয়ভাবে সংগ্রহ করে একটি যাচাইকৃত ও কাঠামোগত ডাটাবেজ গড়ে তোলা, যাতে যে কেউ স্বাধীনভাবে গবেষণা ও অনুসন্ধান করতে পারে।', en: 'An automated pipeline ingesting verified reporting from mainstream Bangladeshi news outlets into a structured, queryable corruption database for researchers, journalists, and citizens.' },
    'how_it_works_title': { bn: 'এটি কীভাবে কাজ করে?', en: 'How It Works' },
    'how_it_works_desc': { bn: 'প্ল্যাটফর্মটি তিন স্তরের একটি স্বয়ংক্রিয় পাইপলাইনের মাধ্যমে পরিচালিত হয়:', en: 'The platform operates through a 3-tier automated intelligence pipeline:' },
    'step_1_title': { bn: '১. রিয়েল-টাইম তথ্য সংগ্রহ (Crawling)', en: '1. Real-Time News Ingestion (Crawling)' },
    'step_1_desc': { bn: 'জাতীয় শীর্ষ সংবাদমাধ্যমগুলো থেকে প্রতি কয়েক ঘণ্টায় স্বয়ংক্রিয়ভাবে তাজা খবর সংগ্রহ করা হয়।', en: 'Automated scrapers crawl major Bangladeshi national newspapers every few hours.' },
    'step_2_title': { bn: '২. এআই বিশ্লেষণ ও আর্থিক মূল্যায়ন (AI NLP)', en: '2. AI Analysis & Financial Structuring (NLP)' },
    'step_2_desc': { bn: 'উন্নত লার্জ ল্যাঙ্গুয়েজ মডেল (LLM) সংবাদের সত্যতা যাচাই, দুর্নীতির খাত নির্ধারণ, জড়িত ব্যক্তি/প্রতিষ্ঠান, অর্থের পরিমাণ ও আইনি অবস্থা আলাদা করে।', en: 'State-of-the-art LLMs extract verified facts, classify corruption categories, financial loss in BDT, accused entities, and legal investigation status.' },
    'step_3_title': { bn: '৩. উন্মুক্ত প্রকাশ ও ম্যাপিং (Open Data)', en: '3. Open Data & Visualization' },
    'step_3_desc_pre_bold': { bn: 'যাচাইকৃত তথ্যগুলো তাৎক্ষণিকভাবে ', en: 'Structured datasets are immediately published via ' },
    'step_3_bold': { bn: 'ইন্টারেক্টিভ মানচিত্র ও ডাটাবেজে', en: 'Interactive Maps & Searchable Tables' },
    'step_3_desc_post_bold': { bn: ' সবার জন্য উন্মুক্ত করা হয়।', en: ' for universal open access.' },
    'automated_quote': { bn: '“আর্থিক স্বচ্ছতা ও তথ্যের অবাধ প্রবাহই সুশাসন ও ন্যায়ের মূল ভিত্তি।”', en: '“Financial transparency and open data access are the cornerstones of accountability and good governance.”' },
    'use_cases_title': { bn: 'কাদের জন্য এই প্ল্যাটফর্ম?', en: 'Who Can Use This Platform?' },
    'human_rights_title': { bn: 'দুর্নীতি বিরোধী সংস্থা ও সুশীল সমাজ', en: 'Anti-Corruption Bodies & Civil Society' },
    'human_rights_desc': { bn: 'দুর্নীতির প্রবণতা পর্যবেক্ষণ, নীতি সংস্কার ও আর্থিক অডিট বিশ্লেষণে সহায়ক সঠিক পরিসংখ্যান।', en: 'Empirical datasets to support policy advocacy, institutional audits, and anti-graft research.' },
    'law_enforcement_title': { bn: 'তদন্তকারী সংস্থা ও আইনজীবী', en: 'Investigative Agencies & Legal Observers' },
    'law_enforcement_desc': { bn: 'অভিযোগ, দুদকের অনুসন্ধান, চার্জশিট ও মামলার অবস্থা ট্র্যাক করার সুনির্দিষ্ট তথ্য।', en: 'Track verified allegations, ACC inquiries, chargesheets, and judicial progress across sectors.' },
    'general_public_title': { bn: 'সাধারণ নাগরিক ও অনুসন্ধানী সাংবাদিক', en: 'Investigative Journalists & Citizens' },
    'general_public_desc': { bn: 'সরকারি প্রকল্পের অপব্যবহার, ব্যাংক কেলেঙ্কারি ও জনসাধারণের তহবিলের সঠিক চিত্র জানা।', en: 'Investigate public fund allocations, banking irregularities, and district-level governance.' },
    'data_terms_title': { bn: 'তথ্যের উৎস ও নীতিমালা', en: 'Data Source & Disclaimer' },
    'data_terms_desc': { bn: 'প্ল্যাটফর্মের সকল তথ্য মূলধারার শীর্ষ গণমাধ্যম থেকে সরাসরি উদ্ধৃত। প্রতিটি তথ্যের সাথে মূল সংবাদের লিঙ্ক সংযুক্ত রয়েছে।', en: 'All data is aggregated transparently from accredited national news sources, citing direct attribution and original canonical links.' },

    // Technical Collaboration & Services Page
    'business_hero_title': { bn: 'প্রযুক্তিগত সহযোগিতা ও ডেটা ইঞ্জিনিয়ারিং', en: 'Technical Collaboration & Data Engineering' },
    'business_hero_desc': { 
        bn: 'আমরা দুর্নীতি বিরোধী গবেষণা সংস্থা, থিংকট্যাংক, অনুসন্ধানী সাংবাদিক ও সুশীল সমাজের সাথে যৌথভাবে কাস্টম ডেটা ক্রলার, এআই অ্যানালাইসিস পাইপলাইন ও ইন্টেলিজেন্স ড্যাশবোর্ড তৈরিতে কাজ করি।', 
        en: 'We partner with anti-corruption watchdogs, think tanks, investigative newsrooms, and civil society to engineer high-resilience web scrapers, LLM forensic pipelines, and interactive analytics platforms.' 
    },
    'contact_consultation': { bn: 'পরামর্শের জন্য যোগাযোগ করুন', en: 'Contact for Consultation' },
    'what_we_build': { bn: 'আমরা যা তৈরি করি', en: 'What We Build' },
    'services_desc': { 
        bn: 'স্বয়ংক্রিয় ডেটা সংগ্রহ থেকে শুরু করে এআই-চালিত আর্থিক অপরাধ ফরেনসিক অ্যানালিটিক্স পর্যন্ত শক্তিশালী সমাধান।', 
        en: 'From automated public data ingestion to AI-driven financial crime forensic analytics, we build robust end-to-end data systems.' 
    },
    'custom_scrapers': { bn: 'স্বয়ংক্রিয় ডেটা সংগ্রহ ও ক্রলিং', en: 'Automated Data Ingestion & Crawlers' },
    'scrapers_desc': { 
        bn: 'জটিল ও ডায়নামিক পোর্টাল থেকে রিয়েল-টাইম সংবাদ ও সরকারি গেজেট সংগ্রহের স্বয়ংক্রিয় স্ক্র্যাপিং সিস্টেম।', 
        en: 'Fault-tolerant, automated crawlers engineered for real-time aggregation across complex news portals and public registries.' 
    },
    'ai_nlp_tools': { bn: 'এআই ও এনএলপি ফরেনসিক টুলস', en: 'AI & NLP Forensic Structuring' },
    'ai_desc': { 
        bn: 'সংবাদ ও নথি থেকে টাকার পরিমাণ (BDT) হিসাব, জড়িত ব্যক্তি ও প্রতিষ্ঠান শনাক্তকরণ এবং দুদকের অনুসন্ধান স্থিতি নির্ধারণ।', 
        en: 'Extract financial damages in BDT, identify accused corporate entities, and classify judicial investigation stages.' 
    },
    'analytics_dashboards': { bn: 'ইন্টারেক্টিভ ড্যাশবোর্ড ও মানচিত্র', en: 'Interactive Dashboards & Geo-Maps' },
    'dashboards_desc': { 
        bn: 'নেক্সট.জেএস ও ক্লাউড প্রযুক্তিতে তৈরি দ্রুতগতির ভিজ্যুয়াল ড্যাশবোর্ড, জেলাভিত্তিক মানচিত্র ও ফিল্টারিং সুবিধা।', 
        en: 'Blazing fast Next.js applications featuring spatial district heatmaps, sectoral breakdown charts, and full data export.' 
    },
    'tech_stack': { bn: 'আমরা যে প্রযুক্তিতে দক্ষ', en: 'Technologies We Master' },
    'ready_to_build': { bn: 'আপনার সমাধান তৈরি করতে প্রস্তুত?', en: 'Ready to Build Your Solution?' },
    'build_desc': { 
        bn: 'আসুন আলোচনা করি কিভাবে আমরা আপনার তথ্য সংগ্রহ ও বিশ্লেষণ প্রক্রিয়া স্বয়ংক্রিয় করতে পারি।', 
        en: 'Let’s discuss how automated pipelines and custom AI models can empower your investigative research.' 
    },
    'talk_to_expert': { bn: 'বিশেষজ্ঞের সাথে কথা বলুন', en: 'Talk to an Expert' },

    // FAQ Page
    'faq_title': { bn: 'সাধারণ জিজ্ঞাসা (FAQ)', en: 'Frequently Asked Questions' },
    'faq_desc': { bn: 'আমাদের প্ল্যাটফর্ম, ডাটা পদ্ধতি ও প্রযুক্তি সম্পর্কে সাধারণ প্রশ্নের উত্তরসমূহ।', en: 'Everything you need to know about our data methodologies, verification, and technology.' },
    'faq_cat_general': { bn: 'সাধারণ তথ্য ও কার্যপদ্ধতি', en: 'General & Methodology' },
    'faq_q1': { bn: 'এই প্ল্যাটফর্মের উদ্দেশ্য কী?', en: 'What is the purpose of this platform?' },
    'faq_a1': { bn: 'আমাদের উদ্দেশ্য হলো বাংলাদেশের জাতীয় ঘটনাবলীর একটি নিরপেক্ষ, যাচাইকৃত ও উন্মুক্ত তথ্যভান্ডার তৈরি করা।', en: 'Our mission is to maintain an impartial, open, and empirical record of documented national incidents for public accountability.' },
    'faq_q2': { bn: 'তথ্যের উৎস কী?', en: 'Where does the data come from?' },
    'faq_a2': { bn: 'বাংলাদেশের শীর্ষস্থানীয় মূলধারার জাতীয় দৈনিক ও অনলাইন সংবাদমাধ্যম থেকে স্বয়ংক্রিয়ভাবে তথ্য সংগ্রহ করা হয়।', en: 'Data is crawled directly from leading verified Bangladeshi national news publishers and verified press outlets.' },
    'faq_q3': { bn: 'তথ্য কতটা নির্ভরযোগ্য?', en: 'How reliable is the data?' },
    'faq_a3': { bn: 'প্রতিটি ঘটনার সাথে মূল সংবাদের সরাসরি লিঙ্ক, সংবাদপত্রের নাম ও প্রকাশের সময় স্পষ্টভাবে উল্লেখ থাকে।', en: 'Every documented event includes direct citation links to the original newspaper articles with full publication timestamps.' },
    'faq_q4': { bn: 'ডাটা কি বিনামূল্যে ব্যবহার করা যায়?', en: 'Is the data freely accessible?' },
    'faq_a4': { bn: 'হ্যাঁ, আমাদের প্ল্যাটফর্মের সমস্ত পাবলিক ডাটা গবেষক, সাংবাদিক ও নাগরিকদের জন্য উন্মুক্ত ও ডাউনলোডযোগ্য।', en: 'Yes, all public records can be browsed, filtered, and exported in CSV, Excel, and JSON formats for research.' },
    'faq_cat_tech': { bn: 'প্রযুক্তি ও এআই বিশ্লেষণ', en: 'Technology & AI Processing' },
    'faq_q5': { bn: 'এআই কীভাবে ঘটনা শ্রেণিবিন্যাস করে?', en: 'How does the AI categorize incidents?' },
    'faq_a5': { bn: 'আমাদের উন্নত এআই ইঞ্জিন সংবাদের বিষয়বস্তু বিশ্লেষণ করে ঘটনা, স্থান, সংশ্লিষ্ট পক্ষ এবং গভীরতা নির্ধারণ করে।', en: 'Our NLP pipeline analyzes semantic context, extracts key actors, locations, severity scores, and filters duplicates.' },
    'faq_q6': { bn: 'ক্রলার কত ঘন ঘন তথ্য আপডেট করে?', en: 'How frequently does the crawler update?' },
    'faq_a6': { bn: 'আমাদের ক্রলার দিনে একাধিকবার স্বয়ংক্রিয়ভাবে নতুন প্রকাশিত সংবাদের জন্য নজরদারি করে।', en: 'The background crawling pipeline runs multiple times daily to ingest and process breaking updates.' },
    'faq_q8': { bn: 'ডুপ্লিকেট সংবাদ কীভাবে বাদ দেওয়া হয়?', en: 'How are duplicate articles handled?' },
    'faq_a8': { bn: 'একাধিক পত্রিকায় একই ঘটনা প্রকাশিত হলে এআই সেগুলোকে চিহ্নিত করে একক ঘটনায় একত্রিত করে।', en: 'Our intelligent cross-referencing engine detects overlapping events across multiple newspapers and merges them.' },
    'faq_q9': { bn: 'ভুল তথ্য থাকলে তা কীভাবে সংশোধন করা হয়?', en: 'How are inaccuracies corrected?' },
    'faq_a9': { bn: 'আমাদের অডিট প্যানেল এবং ম্যানুয়াল রিভিউ সিস্টেম নিয়মিত ডাটাবেজের সঠিকতা যাচাই করে।', en: 'We operate an active audit trail and curation review system to continually calibrate model confidence and accuracy.' },
    'faq_cat_access': { bn: 'ডাটা ডাউনলোড ও নিরাপত্তা', en: 'Data Access & Integrity' },
    'faq_q10': { bn: 'কী কী ফরম্যাটে ডাটা ডাউনলোড করা যায়?', en: 'Which export formats are supported?' },
    'faq_a10': { bn: 'আপনি CSV, Excel (XLSX), JSON এবং GeoJSON ফরম্যাটে ফিল্টারকৃত ডাটা ডাউনলোড করতে পারেন।', en: 'You can export customized slices in CSV, Excel (.xlsx), JSON, and GeoJSON formats.' },
    'faq_q11': { bn: 'এপিআই (API) কি উন্মুক্ত আছে?', en: 'Is there a public API available?' },
    'faq_a11': { bn: 'হ্যাঁ, আমাদের এপিআই এন্ডপয়েন্ট থেকে সরাসরি রিয়েল-টাইম ডাটা সংগ্রহ করা সম্ভব।', en: 'Yes, public JSON endpoints provide programmable access for downstream researchers and applications.' },
    'faq_q12': { bn: 'আমরা কীভাবে সাহায্য বা সহযোগিতা করতে পারি?', en: 'How can we contribute or collaborate?' },
    'faq_a12': { bn: 'ফিডব্যাক, নতুন তথ্যসূত্র পরামর্শ বা সহযোগিতার জন্য আমাদের সাথে যোগাযোগ করতে পারেন।', en: 'You are welcome to suggest new news sources, report bugs, or collaborate on academic research projects.' },

    // Download Portal Page
    'dl_title': { bn: 'উন্মুক্ত ডাটা এক্সপোর্ট পোর্টাল', en: 'Open Data Export Portal' },
    'dl_subtitle': { bn: 'গবেষক, সাংবাদিক ও নাগরিক সমাজের জন্য যাচাইকৃত ডাটাবেজ ডাউনলোড করুন', en: 'Download verified, research-grade datasets for journalism, policy, and academic analysis' },
    'dl_dataset': { bn: '১. ডাটাবেজ নির্বাচন', en: '1. Select Dataset' },
    'dl_records': { bn: 'রেকর্ড সংখ্যা', en: 'records' },
    'dl_filters': { bn: '২. ফিল্টারিং অপশন', en: '2. Filter Data' },
    'dl_reset': { bn: 'রিসেট', en: 'Reset Filters' },
    'dl_from': { bn: 'শুরুর তারিখ', en: 'From Date' },
    'dl_to': { bn: 'শেষের তারিখ', en: 'To Date' },
    'dl_district': { bn: 'জেলা', en: 'District' },
    'dl_all': { bn: 'সকল', en: 'All' },
    'dl_category': { bn: 'ক্যাটেগরি', en: 'Category' },
    'dl_min_killed': { bn: 'নূন্যতম নিহত', en: 'Min. Killed' },
    'dl_party': { bn: 'রাজনৈতিক দল / পক্ষ', en: 'Political Party' },
    'dl_source': { bn: 'সংবাদের উৎস', en: 'Media Source' },
    'dl_status': { bn: 'অবস্থা', en: 'Processing Status' },
    'dl_processed': { bn: 'প্রসেস করা হয়েছে', en: 'Processed Only' },
    'dl_unprocessed': { bn: 'অপেক্ষমান (Unprocessed)', en: 'Unprocessed Only' },
    'dl_stats_by': { bn: 'পরিসংখ্যান গ্রুপিং', en: 'Aggregate Stats By' },
    'dl_by_day': { bn: 'দৈনিক ভিত্তিতে (By Day)', en: 'Daily Timeline' },
    'dl_by_category': { bn: 'ক্যাটেগরি ভিত্তিতে (By Category)', en: 'Category Breakdown' },
    'dl_by_district': { bn: 'জেলা ভিত্তিতে (By District)', en: 'District Breakdown' },
    'dl_raw_note': { bn: 'নোট: বড় সাইজের কন্টেন্ট ফিল্টার করে ডাউনলোড করতে ফিল্টার ব্যবহার করুন।', en: 'Note: Use filters to restrict download size for bulk scraped articles.' },
    'dl_columns': { bn: '৩. কলাম নির্বাচন (ঐচ্ছিক)', en: '3. Select Columns (Optional)' },
    'dl_select_all': { bn: 'সব নির্বাচন করুন', en: 'Select All' },
    'dl_clear': { bn: 'মুছে ফেলুন', en: 'Clear Selection' },
    'dl_download_as': { bn: '৪. ডাউনলোড ফরম্যাট', en: '4. Download Format' },
    'dl_ds_events': { bn: 'যাচাইকৃত ঘটনার ডাটাবেজ', en: 'Verified Incidents Dataset' },
    'dl_ds_events_desc': { bn: 'এআই ও গণমাধ্যম দ্বারা যাচাইকৃত ঘটনার ভৌগোলিক, রাজনৈতিক ও হতাহতের সম্পূর্ণ তথ্য।', en: 'Clean, structured records with geolocations, casualties, actor tags, and source links.' },
    'dl_ds_raw': { bn: 'সংগৃহীত কাঁচা সংবাদ (Raw Articles)', en: 'Raw Monitored Articles' },
    'dl_ds_raw_desc': { bn: 'সংবাদমাধ্যম থেকে সংগৃহীত অপরিবর্তিত মূল টেক্সট ও মেটাডাটার সংরক্ষণাগার।', en: 'Complete archive of unprocessed scraped article texts and crawl metadata.' },
    'dl_ds_stats': { bn: 'সামষ্টিক পরিসংখ্যান (Aggregated Stats)', en: 'Aggregated Statistics' },
    'dl_ds_stats_desc': { bn: 'দিন, জেলা ও ক্যাটেগরিভিত্তিক সমষ্টিগত সারসংক্ষেপ ও টাইমলাইন।', en: 'Pre-computed daily, district, and categorical statistical aggregates.' },
    'dl_ds_audit': { bn: 'এআই অডিট ও সিদ্ধান্ত ডাটা', en: 'AI Decision Audit Log' },
    'dl_ds_audit_desc': { bn: 'মডেলের যুক্তি, আত্মবিশ্বাস স্কোর ও অন্তর্ভুক্তি/বর্জনের সিদ্ধান্তের লগ।', en: 'Full decision rationales, confidence scores, and inclusion reasoning.' },

    // Footer Component
    'footer_engine': { bn: 'এআই ইন্টেলিজেন্স ইঞ্জিন', en: 'AI Intelligence Engine' },
    'footer_engine_desc': { bn: 'উন্নত লার্জ ল্যাঙ্গুয়েজ মডেলের মাধ্যমে স্বয়ংক্রিয়ভাবে সংবাদ বিশ্লেষণ ও তথ্য যাচাই।', en: 'State-of-the-art LLMs autonomously classify, geocode, and structure complex reporting.' },
    'footer_scraping': { bn: 'স্বয়ংক্রিয় ক্রলিং সিস্টেম', en: 'Automated Crawling System' },
    'footer_scraping_desc': { bn: 'জাতীয় শীর্ষ দৈনিক থেকে বিরতিহীনভাবে প্রকাশিত সংবাদ সংগ্রহ।', en: 'Fault-tolerant background scrapers monitor verified national news portals.' },
    'footer_automation': { bn: 'স্বয়ংক্রিয় পাইপলাইন', en: 'Autonomous Pipeline' },
    'footer_automation_desc': { bn: 'সার্বক্ষণিক পর্যবেক্ষণ, ডুপ্লিকেট দূরীকরণ ও রিয়েল-টাইম তথ্য হালনাগাদ।', en: 'Continuous deduplication, geo-mapping, and instant public publishing.' },
    'footer_bilingual_title': { bn: 'দ্বিভাষিক ওপেন ডাটা', en: 'Bilingual Open Data' },
    'footer_bilingual_desc': { bn: 'বাংলা ও ইংরেজি উভয় ভাষায় উন্মুক্ত গবেষণা ডাটা ও রপ্তানি সুবিধা।', en: 'Full multilingual support in Bengali and English with public export endpoints.' },
    'footer_engineering': { bn: 'প্রযুক্তি ও স্থাপত্য', en: 'Engineering & Data Infrastructure' },
    'footer_built_with': { bn: 'উচ্চ পারফরম্যান্স, স্বচ্ছতা ও নির্ভরযোগ্যতার জন্য আধুনিক প্রযুক্তি স্ট্যাক দ্বারা নির্মিত।', en: 'Engineered for high performance, uncompromising transparency, and reliability.' },
    'footer_status_online': { bn: 'সিস্টেম সক্রিয় ও স্বাভাবিক', en: 'System Operational' },
    'footer_last_run': { bn: 'সর্বশেষ ক্রল সম্পন্ন', en: 'Last Crawler Sync' },
    'footer_rights': { bn: 'সর্বস্বত্ব সংরক্ষিত।', en: 'All rights reserved.' },
    'footer_credit_pre': { bn: 'প্রকৌশল পরিচালনায়', en: 'Developed & maintained by' },
    'footer_credit_link': { bn: 'DeltaFlow Lab', en: 'DeltaFlow Lab' },
    'footer_credit_post': { bn: 'ও উন্মুক্ত তথ্য গবেষকবৃন্দ।', en: '& Open Data Researchers.' }
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

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.title = language === 'bn'
                ? 'বাংলাদেশ দুর্নীতি ট্র্যাকার | আর্থিক অনিয়ম ও দুর্নীতির রিয়েল-টাইম তথ্যভান্ডার'
                : 'Bangladesh Corruption Tracker | Real-Time Financial Crime & Graft Intelligence'
        }
    }, [language])

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
