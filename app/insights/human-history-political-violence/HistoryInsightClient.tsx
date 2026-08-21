'use client'

import { useLanguage } from '@/context/LanguageContext'
import { ArrowLeft, Clock, Share2, Tag } from 'lucide-react'
import Link from 'next/link'
import { TwitterShareButton, TwitterIcon, FacebookShareButton, FacebookIcon, LinkedinShareButton, LinkedinIcon } from 'react-share'

export default function HistoryInsightClient() {
    const { t, language } = useLanguage()
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://violencetracker.org/insights/human-history-political-violence'
    const title = "মানুষের ইতিহাসে রাজনৈতিক সহিংসতার ইতিহাস"

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header / Hero Section */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('back_to_insights') || 'ফিরে যান'}
                    </Link>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6 font-bengali">
                        মানুষের ইতিহাসে রাজনৈতিক সহিংসতার ইতিহাস
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-bengali">
                        প্রাগৈতিহাসিক যুগ থেকে আধুনিক রাষ্ট্র: ক্ষমতা, সংঘাত ও রাষ্ট্রগঠনের ঐতিহাসিক বিশ্লেষণ
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 border-t border-b border-gray-100 dark:border-slate-700 py-4">
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>১৫ মিনিট পঠন</span>
                        </div>
                        <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            <span>ইতিহাস, রাষ্ট্রবিজ্ঞান</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider mr-2">শেয়ার করুন:</span>
                            <FacebookShareButton url={shareUrl} hashtag="#PoliticalViolenceHistory">
                                <FacebookIcon size={32} round />
                            </FacebookShareButton>
                            <TwitterShareButton url={shareUrl} title={title}>
                                <TwitterIcon size={32} round />
                            </TwitterShareButton>
                            <LinkedinShareButton url={shareUrl} title={title}>
                                <LinkedinIcon size={32} round />
                            </LinkedinShareButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <article className="max-w-3xl mx-auto px-4 py-12">
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none font-bengali">

                    {/* Section 1 */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-red-500 pl-4">
                            ১) ভূমিকা ও ধারণাগত কাঠামো
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            রাজনৈতিক সহিংসতা বলতে সাধারণভাবে এমন সহিংস কার্যকলাপ বোঝায়, যা ক্ষমতা (শাসন/রাষ্ট্রক্ষমতা), ভূখণ্ড, নীতি, মতাদর্শ, পরিচয় বা রাষ্ট্র-সম্পর্কিত দাবিদাওয়া ঘিরে সংঘটিত হয়—যেখানে সহিংসতা কেবল "অপরাধ" নয়, বরং রাজনৈতিক লক্ষ্য অর্জনের মাধ্যম বা পার্শ্ব-ফল হিসেবে কাজ করে। আধুনিক গবেষণায় রাজনৈতিক সহিংসতাকে প্রায়ই তিনটি বড় শ্রেণিতে দেখা হয়:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                            <li><strong>রাষ্ট্রভিত্তিক সশস্ত্র সংঘাত:</strong> রাষ্ট্র বনাম রাষ্ট্র বা রাষ্ট্র বনাম বিদ্রোহী গোষ্ঠী।</li>
                            <li><strong>অরাষ্ট্রভিত্তিক সংঘাত:</strong> দুই/একাধিক সংগঠিত অ-রাষ্ট্রীয় গোষ্ঠীর সংঘর্ষ।</li>
                            <li><strong>একপাক্ষিক সহিংসতা:</strong> রাষ্ট্র বা সংগঠিত গোষ্ঠীর দ্বারা বেসামরিকদের বিরুদ্ধে সহিংসতা।</li>
                        </ul>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
                            <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                                আধুনিক রাষ্ট্র কার্যকরভাবে একটি ভূখণ্ডের ভেতরে "বৈধ সহিংসতার একচেটিয়া দাবি" করে—এবং ইতিহাসের বহু পর্যায়ে রাষ্ট্র গঠন ও সম্প্রসারণের কেন্দ্রে সহিংসতার সংগঠিত ব্যবহার বড় ভূমিকা রেখেছে। এই দৃষ্টিভঙ্গি রাজনৈতিক সহিংসতার ইতিহাসকে শুধু "যুদ্ধের ইতিহাস" নয়, বরং রাষ্ট্র-গঠন, প্রশাসন, আইন ও বিপ্লবের আন্তঃসম্পর্কিত ইতিহাস হিসেবে দেখতে সাহায্য করে।
                            </p>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-red-500 pl-4">
                            ২) সময়রেখা (খুব সংক্ষিপ্ত মানচিত্র)
                        </h2>
                        <div className="space-y-4">
                            {[
                                { title: 'প্রাগৈতিহাসিক যুগ (খ্রি.পূ. ~১২,০০০–১০,০০০+)', desc: 'আন্তঃগোষ্ঠী সহিংসতার প্রাচীনতম প্রত্নপ্রমাণ (কবরস্থান/কঙ্কাল বিশ্লেষণ)।' },
                                { title: 'প্রাচীন রাষ্ট্র ও সাম্রাজ্য (খ্রি.পূ. ৩,০০০–৫০০)', desc: 'রাজ্য-উত্থান, যুদ্ধ, দমন, নির্বাসন/ডিপোর্টেশন—"রাষ্ট্রীয় সহিংসতা"কে বৈধতা দেওয়ার রীতি।' },
                                { title: 'ধ্রুপদী যুগ (খ্রি.পূ. ৫০০–খ্রি. ৫০০)', desc: 'গৃহদ্বন্দ্ব (stasis), গৃহযুদ্ধ, প্রজাতন্ত্র/সাম্রাজ্য সংকট।' },
                                { title: 'মধ্যযুগ ও প্রাক-আধুনিক (খ্রি. ৫০০–১৬৪৮)', desc: 'সামন্ত সংঘর্ষ, ধর্মীয়/রাজবংশীয় যুদ্ধ, নগর-রাষ্ট্রের সংঘাত।' },
                                { title: 'আধুনিক রাষ্ট্রব্যবস্থার উত্থান (১৬৪৮–১৯শ শতক)', desc: 'সার্বভৌমত্ব, স্থায়ী সেনা, কর-আমলাতন্ত্র; বিপ্লব ও উপনিবেশ।' },
                                { title: '২০শ–২১শ শতক', desc: 'টোটাল ওয়ার, গণহত্যা, আন্তর্জাতিক মানবাধিকার আইন; সশস্ত্র বিদ্রোহ, সন্ত্রাসবাদ ও ডিজিটাল সহিংসতা।' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="min-w-[4px] h-full bg-gray-200 dark:bg-gray-700 relative mt-2 rounded-full">
                                        <div className="absolute top-0 left-[-3px] w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-red-500 pl-4">
                            ৩) প্রাগৈতিহাসিক যুগ: "রাজনৈতিক" সহিংসতার গোড়ার সামাজিক ভিত্তি
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            "রাজনীতি" শব্দটি রাষ্ট্রের আগের যুগে সরাসরি প্রযোজ্য নয়, কিন্তু ক্ষমতা-সম্পর্ক, সম্পদ-প্রতিযোগিতা, ভূখণ্ড ও গোষ্ঠী-পরিচয়—এগুলো ছিল; এবং প্রত্নতাত্ত্বিক প্রমাণ দেখায় যে মানুষের সমাজে সংগঠিত সহিংসতা অনেক পুরনো।
                        </p>

                        <div className="space-y-6 mt-6">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">৩.১ জেবেল সাহাবা (নাইল উপত্যকা)</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    সুদান-ইজিপ্ট সীমান্তসংলগ্ন নাইল উপত্যকায় জেবেল সাহাবা কবরস্থানে কঙ্কালগুলোর পুনঃবিশ্লেষণে বহু ব্যক্তির শরীরে প্রজেক্টাইল/আঘাতের চিহ্ন পাওয়া গেছে। এটি একবারের যুদ্ধ নয়, বরং পুনরাবৃত্ত সহিংসতার ধারাবাহিকতা নির্দেশ করে, যা সম্ভবত জলবায়ু বা সম্পদ-চাপের ফল।
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">৩.২ নাটারুক (কেনিয়া)</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    নাটারুকে পাওয়া শিকারি-সংগ্রাহকদের দেহাবশেষ বিশ্লেষণ করে গবেষকরা পরিকল্পিত আন্তঃগোষ্ঠী হামলার প্রমাণ পেয়েছেন। এটি প্রমাণ করে যে "রাষ্ট্র" ছাড়াও সংগঠিত সহিংসতা মানুষের ইতিহাসে বিদ্যমান ছিল।
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">৩.৩ প্রারম্ভিক কৃষিযুগ</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    ইউরোপের প্রারম্ভিক কৃষিযুগে (নিওলিথিক) বিভিন্ন স্থানে, যেমন জার্মানির Schöneck-Kilianstädten গণকবরে, সমষ্টিগত হত্যাকাণ্ড ও পরিকল্পিত আঘাতের চিহ্ন পাওয়া যায়। এটি জনসংখ্যা, ভূমি ও সম্পদের চাপের সাথে সহিংসতার সম্পর্কের আদি নমুনা।
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-red-500 pl-4">
                            ৪) প্রাচীন রাষ্ট্র ও সাম্রাজ্য: "রাষ্ট্রীয় সহিংসতা" ও বৈধতার ভাষা
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            রাষ্ট্র জন্মানোর পর সহিংসতা শুধু সংঘর্ষ নয়, শাসনের যন্ত্র হয়ে ওঠে—যুদ্ধ, কর, আইন, শাস্তি, বাধ্যতামূলক শ্রম ও নির্বাসন সব কিছু একই কাঠামোয় যুক্ত হয়।
                        </p>
                        <ul className="list-disc pl-6 space-y-4 text-gray-700 dark:text-gray-300">
                            <li>
                                <strong>মেসোপটেমিয়া:</strong> প্রাচীন রাজ্যগুলোর উত্থানে যুদ্ধ ছিল কেন্দ্রীয়। "রাষ্ট্র-সমর্থিত বা দৈব-সমর্থিত সহিংসতাই বৈধ"—এমন রাজনৈতিক বয়ান গড়ে ওঠে। সহিংসতা হয়ে ওঠে রাষ্ট্রের পরিচয় ও শৃঙ্খলার প্রতীক।
                            </li>
                            <li>
                                <strong>আসিরীয় সাম্রাজ্য:</strong> জনসংখ্যা স্থানান্তর (Deportation) ছিল শাসনের একটি সুসংগঠিত কৌশল। বিদ্রোহ দমন, শ্রম-সরবরাহ ও সীমান্ত নিয়ন্ত্রণে এটি ব্যবহৃত হতো। এটি প্রমাণ করে যে রাজনৈতিক সহিংসতা কেবল হত্যা নয়, বরং উচ্ছেদ ও সামাজিক ভাঙনের মাধ্যমেও প্রয়োগ করা হয়েছে।
                            </li>
                        </ul>
                    </div>

                    {/* Section 5 */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-red-500 pl-4">
                            ৫) ধ্রুপদী যুগ: গৃহদ্বন্দ্ব (Stasis), প্রজাতন্ত্র সংকট ও ক্ষমতার লড়াই
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            রাষ্ট্র বড় হলে সহিংসতা কেবল বাইরের যুদ্ধ নয়; ভেতরের ক্ষমতার দ্বন্দ্বও (গৃহদ্বন্দ্ব, রাজনৈতিক হত্যা) বড় উৎস হয়ে ওঠে।
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-lg">
                                <h3 className="font-bold text-lg mb-2 text-red-600 dark:text-red-400">গ্রিস: "স্টাসিস"</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    থুসিডিদিসের আলোচনায় দেখা যায়, নগররাষ্ট্রগুলোতে দলীয় বিভাজনজনিত সহিংস গৃহদ্বন্দ্ব বা "স্টাসিস" বারবার ফিরে আসে। এটি রাজনৈতিক আচরণ ও শাসন সংকটের একটি ধ্রুপদী উদাহরণ।
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-lg">
                                <h3 className="font-bold text-lg mb-2 text-red-600 dark:text-red-400">রোম: সহিংসতার স্বাভাবিকীকরণ</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    রোমের প্রজাতান্ত্রিক রাজনীতির শেষ পর্যায়ে সন্দেহ ও দলাদলি সহিংসতাকে রাজনৈতিক প্রক্রিয়ার অংশ বানিয়ে ফেলে, যা শেষ পর্যন্ত গৃহযুদ্ধের রূপ নেয়।
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 bg-gray-50 dark:bg-slate-800 p-5 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-red-600 dark:text-red-400">চীন: যুদ্ধরত রাজ্যসমূহ (Warring States)</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                ওয়ারিং স্টেটস যুগ (খ্রি.পূ. ৪৫৩–২২১) ছিল রাষ্ট্রগঠন ও যুদ্ধনীতির এক গভীর রূপান্তরের সময়। এখানে সহিংসতা কেবল ধ্বংস নয়, বরং প্রশাসনিক উদ্ভাবন ও নৈতিক বিতর্কের জন্ম দিয়েছে।
                            </p>
                        </div>
                    </div>

                    {/* Section 6 & 7 */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-red-500 pl-4">
                            ৬) মধ্যযুগ থেকে আধুনিকতা: সার্বভৌম রাষ্ট্র ও "জনতার রাজনীতি"
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            <strong>ওয়েস্টফালিয়া (১৬৪৮):</strong> ইউরোপীয় রাষ্ট্রব্যবস্থায় সার্বভৌমত্বের স্বীকৃতি সহিংসতাকে ব্যক্তিগত সেনাদল থেকে রাষ্ট্রের নিয়মিত বাহিনীর অধীনে নিয়ে আসে।
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            <strong>ফরাসি বিপ্লব ও "Reign of Terror":</strong> ১৮শ-১৯শ শতকে সহিংসতা "জনতার রাজনীতি"-তে প্রবেশ করে। ১৭৯৩-৯৪ সালের "Reign of Terror" দেখায় কিভাবে রাষ্ট্রের নামে "নৈতিক শুদ্ধি" বা বিপ্লব রক্ষার হাতিয়ার হিসেবে ব্যাপক দমন-পীড়ন চালানো হয়।
                        </p>
                    </div>

                    {/* Section 8 & 9 */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-red-500 pl-4">
                            ৭) ২০শ শতক থেকে বর্তমান: টোটাল ওয়ার, গণহত্যা ও ডেটা-যুগ
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            ২০শ শতকে প্রযুক্তি ও মতাদর্শের সংযোগে সহিংসতার তীব্রতা বাড়ে। গণহত্যা (Genocide) আন্তর্জাতিক আইনে অপরাধ হিসেবে চিহ্নিত হয় এবং জেনেভা কনভেনশন বেসামরিকদের সুরক্ষায় নিয়ম প্রতিষ্ঠা করে।
                        </p>
                        <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-6">
                            <h3 className="text-xl font-bold mb-3">ডেটা-যুগে রাজনৈতিক সহিংসতা</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                আধুনিক যুগে আমরা UCDP বা Global Terrorism Database (GTD)-এর মতো ডেটাসেট ব্যবহার করে সংঘাত পরিমাপ করি। এখন সহিংসতা কেবল রাষ্ট্র বনাম রাষ্ট্র নয়; সন্ত্রাসবাদ, হাইব্রিড সংঘাত এবং তথ্য-অপারেশনও এখন যুদ্ধের অংশ।
                            </p>
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded text-sm text-slate-700 dark:text-slate-300">
                                <strong>UCDP সংজ্ঞা:</strong> সংঘাতকে "Organized Violence" হিসেবে তিন ভাগে দেখা হয়—রাষ্ট্রভিত্তিক, অ-রাষ্ট্রভিত্তিক, এবং একপাক্ষিক (বেসামরিকদের বিরুদ্ধে)।
                            </div>
                        </div>
                    </div>

                    {/* Section 10: Analytical Synthesis */}
                    <div className="mb-12 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-indigo-500 pl-4">
                            ৮) ইতিহাসজুড়ে পুনরাবৃত্ত "কারণ-চক্র" (Analytical Synthesis)
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">১</span>
                                <p className="text-gray-700 dark:text-gray-300"><strong>সম্পদ ও পরিবেশগত চাপ</strong> <span className="text-gray-400">→</span> গোষ্ঠী প্রতিযোগিতা ও আক্রমণ।</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">২</span>
                                <p className="text-gray-700 dark:text-gray-300"><strong>রাষ্ট্র-গঠন ও কেন্দ্রীয়করণ</strong> <span className="text-gray-400">→</span> কর, সেনা ও আইনের মাধ্যমে সহিংসতার বৈধতা রাষ্ট্রের হাতে কেন্দ্রীভূত।</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">৩</span>
                                <p className="text-gray-700 dark:text-gray-300"><strong>বৈধতা সংকট</strong> <span className="text-gray-400">→</span> গৃহদ্বন্দ্ব, অভ্যুত্থান ও দমন।</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">৪</span>
                                <p className="text-gray-700 dark:text-gray-300"><strong>পরিচয় ও মতাদর্শ</strong> <span className="text-gray-400">→</span> শত্রু নির্মাণ, শুদ্ধি অভিযান ও বিপ্লবী টেরর।</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">৫</span>
                                <p className="text-gray-700 dark:text-gray-300"><strong>প্রযুক্তি ও সংগঠন</strong> <span className="text-gray-400">→</span> স্কেল বৃদ্ধি, বেসামরিক ক্ষতি এবং নিয়ন্ত্রণে আন্তর্জাতিক আইন।</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 11: Conclusion */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            ৯) উপসংহার
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            মানুষের ইতিহাসে রাজনৈতিক সহিংসতা কোনো একক "অস্বাভাবিক বিচ্যুতি" নয়; বরং এটি বারবার দেখা দিয়েছে ক্ষমতা ও শাসনব্যবস্থার বিবর্তনের সঙ্গে। প্রাগৈতিহাসিক গোষ্ঠীদ্বন্দ্ব থেকে শুরু করে আধুনিক ডেটা-পরিমাপযোগ্য সংঘাত—সবই একটি মৌলিক প্রশ্নকে সামনে আনে: <strong>সহিংসতা কীভাবে শাসন, বৈধতা ও সামাজিক সংগঠনের সঙ্গে জড়িয়ে পড়ে—এবং কীভাবে প্রতিষ্ঠান, আইন ও নৈতিক কাঠামো তাকে সীমাবদ্ধ করার চেষ্টা করে।</strong>
                        </p>
                    </div>

                    {/* References */}
                    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">রেফারেন্স ও আরও পঠন:</h4>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>UCDP Definitions (Organized violence) — Uppsala University.</li>
                            <li>Max Weber, Politics as a Vocation.</li>
                            <li>Charles Tilly, War Making and State Making as Organized Crime.</li>
                            <li>Isabelle Crevecoeur et al., “New insights on interpersonal violence… Jebel Sahaba,” Scientific Reports (2021).</li>
                            <li>M. M. Lahr et al., “Inter-group violence… Nataruk,” Nature (2016).</li>
                            <li>Christian Meyer et al., “The massacre mass grave of Schöneck-Kilianstädten…,” PNAS (2015).</li>
                            <li>“Violence and State Power in Early Mesopotamia,” Cambridge World History of Violence.</li>
                            <li>Thucydides-এর stasis মডেল নিয়ে Cambridge ও Brill আলোচনা।</li>
                            <li>Encyclopaedia Britannica: Reign of Terror, Peace of Westphalia.</li>
                            <li>UN Genocide Convention & Geneva Conventions (ICRC).</li>
                            <li>Global Terrorism Database (START, University of Maryland).</li>
                        </ol>
                    </div>

                </div>
            </article>
        </div>
    )
}
