'use client'

import { useLanguage } from '@/context/LanguageContext'
import { ArrowLeft, Clock, Share2, Tag, BookOpen, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { TwitterShareButton, TwitterIcon, FacebookShareButton, FacebookIcon, LinkedinShareButton, LinkedinIcon } from 'react-share'

export default function SouthAsiaInsightClient() {
    const { t, language } = useLanguage()
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://violencetracker.org/insights/election-violence-south-asia-nations'
    const title = "দক্ষিন এশিয়ার দেশগুলোয় জাতীয় নির্বাচনে সহিংসতার ইতিহাস"

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
                        দক্ষিন এশিয়ার দেশগুলোয় জাতীয় নির্বাচনে সহিংসতার ইতিহাস
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-bengali">
                        গণতান্ত্রিক আকাঙ্ক্ষা ও ক্ষমতার দ্বন্দ্ব: ভারত, পাকিস্তান, বাংলাদেশ, শ্রীলঙ্কা ও নেপালে নির্বাচন ও সংঘাতের ঐতিহাসিক বিশ্লেষণ
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 border-t border-b border-gray-100 dark:border-slate-700 py-4">
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>২০ মিনিট পঠন</span>
                        </div>
                        <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            <span>রাজনীতি, নির্বাচন, দক্ষিণ এশিয়া</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider mr-2">শেয়ার করুন:</span>
                            <FacebookShareButton url={shareUrl} hashtag="#SouthAsiaElectionViolence">
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

                    {/* Intro */}
                    <div className="mb-8">
                        <p className="lead text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                            দক্ষিণ এশিয়ার রাজনৈতিক ইতিহাসে জাতীয় নির্বাচন একাধারে গণতান্ত্রিক আকাঙ্ক্ষার বহিঃপ্রকাশ এবং ক্ষমতার দ্বন্দ্বে লিপ্ত গোষ্ঠীগুলোর মধ্যকার সংঘাতের কেন্দ্রবিন্দু। ১৯৪৭ সালে ব্রিটিশ ঔপনিবেশিক শাসনের অবসানের পর থেকে এই অঞ্চলের দেশগুলো—ভারত, পাকিস্তান, শ্রীলঙ্কা এবং পরবর্তীতে ১৯৭১ সালে স্বাধীন হওয়া বাংলাদেশ—গণতান্ত্রিক উত্তরণের পথে নানাবিধ চড়াই-উতরাই অতিক্রম করেছে।
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            এই অঞ্চলের নির্বাচনী প্রক্রিয়াগুলো বিশ্লেষণ করলে দেখা যায় যে, দেশগুলোর স্বাধীনতার পর থেকে অনুষ্ঠিত নির্বাচনগুলোতে অবাধ ও সুষ্ঠু পরিবেশ নিশ্চিত করার প্রচেষ্টার পাশাপাশি রাজনৈতিক অস্থিতিশীলতা, পেশীশক্তির দাপট এবং পদ্ধতিগত কারচুপির এক দীর্ঘ ইতিহাস বিদ্যমান। নির্বাচন কেবলমাত্র সরকার পরিবর্তনের একটি সাংবিধানিক পদ্ধতি নয়, বরং দক্ষিণ এশিয়ার প্রেক্ষাপটে এটি প্রায়শই সামাজিক আধিপত্য রক্ষা এবং রাষ্ট্রীয় সম্পদ বণ্টনের নিয়ন্ত্রণ নেওয়ার একটি জীবন-মরণ লড়াই হিসেবে আবির্ভূত হয়।
                        </p>
                    </div>

                    {/* Section 1: Electoral Integrity */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-red-500 pl-4 flex items-center">
                            <BookOpen className="w-6 h-6 mr-2 text-red-500" />
                            নির্বাচনী সততা ও অবাধ নির্বাচনের বিবর্তনীয় বিশ্লেষণ
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            দক্ষিণ এশিয়ায় নির্বাচনী সততা (Electoral Integrity) পরিমাপের ক্ষেত্রে 'বৈচিত্র্যময় গণতন্ত্র' (V-Dem) সূচক একটি গুরুত্বপূর্ণ মানদণ্ড। ভারতের মতো দেশে দীর্ঘকাল ধরে নির্বাচনী প্রক্রিয়া স্থিতিশীল থাকলেও সাম্প্রতিক বছরগুলোতে 'নির্বাচনী স্বৈরতন্ত্র' (Electoral Autocracy) বা 'চাপের মুখে থাকা গণতন্ত্রের' প্রবণতা লক্ষ্য করা যাচ্ছে। অন্যদিকে বাংলাদেশ এবং পাকিস্তানে নির্বাচনের সুষ্ঠুতা সরাসরি রাষ্ট্রীয় শাসনব্যবস্থার প্রকৃতির ওপর নির্ভর করে পরিবর্তিত হয়েছে।
                        </p>

                        <div className="my-8 space-y-8">
                            {/* Bangladesh */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">বাংলাদেশ: তত্ত্বাবধায়ক বনাম দলীয় শাসনব্যবস্থা</h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    ১৯৯১ থেকে ২০০৮ সাল পর্যন্ত তত্ত্বাবধায়ক সরকারের অধীনে অনুষ্ঠিত চারটি নির্বাচন আন্তর্জাতিকভাবে অবাধ ও সুষ্ঠু হিসেবে স্বীকৃত হয়েছিল। তবে ২০১১ সালে এই ব্যবস্থা বাতিল হওয়ার পর ২০১৪, ২০১৮ এবং ২০২৪ সালের নির্বাচনগুলোতে নির্বাচনী সততার ব্যাপক অবনতি ঘটে।
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="px-4 py-3">নির্বাচনী ব্যবস্থা</th>
                                                <th scope="col" className="px-4 py-3">গড় ভোটার উপস্থিতি (%)</th>
                                                <th scope="col" className="px-4 py-3">গড় নিহতের সংখ্যা</th>
                                                <th scope="col" className="px-4 py-3">গুণগত মান</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">তত্ত্বাবধায়ক (১৯৯১-২০০৮)</td>
                                                <td className="px-4 py-3">৭৩.৪৫%</td>
                                                <td className="px-4 py-3">৪৫.৪</td>
                                                <td className="px-4 py-3 text-green-600 font-semibold">উচ্চ (অবাধ)</td>
                                            </tr>
                                            <tr className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">দলীয় সরকার (২০১৪-২০২৪)</td>
                                                <td className="px-4 py-3">৫৩.৪২%</td>
                                                <td className="px-4 py-3">৫৩.৭</td>
                                                <td className="px-4 py-3 text-red-600 font-semibold">নিম্ন (বিতর্কিত)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* India */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">ভারত: বৃহত্তম গণতন্ত্রের অভ্যন্তরীণ সংকট</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    ভারত নিজেকে বিশ্বের বৃহত্তম গণতন্ত্র হিসেবে প্রতিষ্ঠিত করলেও তার নির্বাচনী প্রক্রিয়ার সততা সর্বদাই সংকটের ঊর্ধ্বে ছিল না। বর্তমান প্রেক্ষাপটে ভারত একটি 'স্ট্রেইনড ডেমোক্রেসি' বা চাপে থাকা গণতন্ত্র হিসেবে চিহ্নিত হচ্ছে। যদিও ইভিএম ব্যবহারের মাধ্যমে গণনায় স্বচ্ছতা এসেছে, তবুও রাজনৈতিক মেরুকরণ এবং শাসক দলের অনুকূলে রাষ্ট্রীয় যন্ত্রের ব্যবহারের অভিযোগ গত এক দশকে তীব্র হয়েছে।
                                </p>
                            </div>

                            {/* Pakistan */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">পাকিস্তান: সামরিক তদারকি ও ব্যর্থতা</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    পাকিস্তানের নির্বাচনী সততা একটি জটিল 'ওভারসাইট সিস্টেম' বা তদারকি ব্যবস্থার মাধ্যমে নিয়ন্ত্রিত হয়, যেখানে অসামরিক সরকারের ওপর সামরিক বাহিনীর প্রভাব অনস্বীকার্য। ১৯৭০ সালের নির্বাচন অবাধ হলেও ফলাফল মেনে না নেওয়ায় রাষ্ট্রীয় বিভাজন ঘটে। সাম্প্রতিক ২০২৪ সালের নির্বাচনেও পিটিআই-এর ওপর দমন-পীড়ন এবং ইন্টারনেটের ওপর নিয়ন্ত্রণ আরোপ নির্বাচনী সুষ্ঠুতাকে প্রশ্নবিদ্ধ করেছে।
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Types of Violence */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-red-500 pl-4">
                            নির্বাচনী সহিংসতার ধরন ও প্রকৃতি
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-lg border border-red-100 dark:border-red-900/30">
                                <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">১. রাজনৈতিক পৃষ্ঠপোষকতা</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    ভারত, নেপাল এবং বাংলাদেশে স্থানীয় ক্যাডার বাহিনী বা 'পেশীশক্তি' ব্যবহার করে ভোটারদের প্রভাবিত করা হয়। তৃণমূল পর্যায়ে সংঘাত একটি নিয়মিত ঘটনা।
                                </p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-lg border border-red-100 dark:border-red-900/30">
                                <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">২. জঙ্গি আক্রমণ</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    পাকিস্তানে টিটিপি (TTP) বা আইএসের মতো উগ্রবাদী গোষ্ঠী নির্বাচনী সমাবেশগুলোতে আত্মঘাতী হামলা চালায়। ভারতের কাশ্মীর ও পাঞ্জাবেও এমন ইতিহাস রয়েছে।
                                </p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-lg border border-red-100 dark:border-red-900/30">
                                <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">৩. রাষ্ট্রীয় দমন-পীড়ন</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    বিরোধী দলের নেতাকর্মীদের গণগ্রেপ্তার, গুম, বিচারবহির্ভূত হত্যাকাণ্ড এবং ডিজিটাল সেন্সরশিপ এখন নির্বাচনী বৈতরণী পার হওয়ার নতুন হাতিয়ার।
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Statistics */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-red-500 pl-4">
                            দেশভিত্তিক হতাহত ও নিহতের পরিসংখ্যান (১৯৪৭-২০২৪)
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">বাংলাদেশ: রক্তক্ষয়ী পালাবদল</h3>
                                <div className="overflow-x-auto border rounded-lg dark:border-slate-700">
                                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-slate-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-4 py-2">সাল / সময়কাল</th>
                                                <th className="px-4 py-2">নিহত</th>
                                                <th className="px-4 py-2">প্রধান কারণ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><td className="px-4 py-2">১৯৮৬ (৩য় সংসদ)</td><td className="px-4 py-2">৪০ জন</td><td className="px-4 py-2">এরশাদ বিরোধী আন্দোলন</td></tr>
                                            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><td className="px-4 py-2">২০০১ (৮ম সংসদ)</td><td className="px-4 py-2">৬৯ জন</td><td className="px-4 py-2">নির্বাচন পরবর্তী সংখ্যালঘু নির্যাতন</td></tr>
                                            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><td className="px-4 py-2">২০০৮ (৯ম সংসদ)</td><td className="px-4 py-2">১৩৮ জন</td><td className="px-4 py-2">প্রচারণাকালীন সংঘাত</td></tr>
                                            <tr className="bg-red-50 dark:bg-red-900/20"><td className="px-4 py-2 font-bold">২০২৪ (গণঅভ্যুত্থান)</td><td className="px-4 py-2 font-bold text-red-600">১৪০০+ জন</td><td className="px-4 py-2">ছাত্র-জনতার আন্দোলনের ওপর গুলি</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">পাকিস্তান: সন্ত্রাসবাদ ও দাঙ্গা</h3>
                                <div className="overflow-x-auto border rounded-lg dark:border-slate-700">
                                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-slate-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-4 py-2">বছর</th>
                                                <th className="px-4 py-2">নিহত</th>
                                                <th className="px-4 py-2">কারণ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><td className="px-4 py-2">১৯৭৭</td><td className="px-4 py-2">৩৫০+</td><td className="px-4 py-2">কারচুপির বিরুদ্ধে বিক্ষোভ</td></tr>
                                            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><td className="px-4 py-2">২০০৮</td><td className="px-4 py-2">৪০০+</td><td className="px-4 py-2">বেনজির ভুট্টো হত্যাকাণ্ড পরবর্তী দাঙ্গা</td></tr>
                                            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><td className="px-4 py-2">২০১৩</td><td className="px-4 py-2">২৪৭</td><td className="px-4 py-2">টিটিপি আত্মঘাতী হামলা</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Women & Technology */}
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">নির্বাচনী সহিংসতায় নারীর অবস্থান</h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                                দক্ষিণ এশিয়ার নির্বাচনী সহিংসতার একটি অন্ধকার দিক হলো নারী প্রার্থীদের ওপর আক্রমণ। ইউএন ওমেন-এর ২০১৪ সালের গবেষণায় দেখা গেছে, ভারত, নেপাল এবং পাকিস্তানে সহিংসতার ভয়ে ৬০ শতাংশ নারী রাজনীতিতে সক্রিয় হতে পিছপা হন। প্রার্থীদের পরিবারকে লক্ষ্যবস্তু করা এবং শ্লীলতাহানির হুমকি একটি সাধারণ কৌশল।
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">প্রযুক্তি ও নির্বাচনের ভবিষ্যৎ</h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                                ভারত ইভিএম ব্যবহারের মাধ্যমে গণনা প্রক্রিয়া দ্রুত করেছে। তবে এআই ব্যবহার করে গুজব ছড়ানো এবং 'ডিপ ফেক' ভিডিওর মাধ্যমে ভোটারদের বিভ্রান্ত করার প্রবণতা আগামী দিনের নির্বাচনে সহিংসতার নতুন ক্ষেত্র তৈরি করতে পারে।
                            </p>
                        </div>
                    </div>

                    {/* Section 5: Analysis & Conclusion */}
                    <div className="mb-12 bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-4">
                            গণতন্ত্রের স্থায়িত্ব ও ঝুঁকি: একটি বিশ্লেষণ
                        </h2>
                        <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc pl-5">
                            <li><strong>ক্ষমতার প্রাতিষ্ঠানিকীকরণের অভাব:</strong> রাষ্ট্রীয় প্রতিষ্ঠানগুলো নিরপেক্ষভাবে কাজ করতে ব্যর্থ।</li>
                            <li><strong>পরিবারতন্ত্র:</strong> গান্ধী, ভুট্টো, শরীফ, হাসিনা, জিয়া ও রাজাপাকসে পরিবারের দীর্ঘকালীন আধিপত্য।</li>
                            <li><strong>মেরুকরণ:</strong> ধর্মীয় ও জাতিগত বিভাজনকে রাজনৈতিক কৌশল হিসেবে ব্যবহার।</li>
                            <li><strong>যুব অসন্তোষ:</strong> বেকারত্ব ও দুর্নীতির বিরুদ্ধে তরুণ প্রজন্মের ক্ষোভ গণঅভ্যুত্থানের জন্ম দিচ্ছে।</li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                            দক্ষিণ এশিয়ার দেশগুলো যদি তাদের নির্বাচনী ব্যবস্থাকে সহিংসতামুক্ত এবং বিশ্বাসযোগ্য করতে না পারে, তবে এই অঞ্চলের সামগ্রিক স্থিতিশীলতা এবং অর্থনৈতিক সমৃদ্ধি চিরকাল ঝুঁকির মুখেই থেকে যাবে। ২০২৪ সালের জুলাই বিপ্লব এবং শ্রীলঙ্কার 'আরাগলায়া' প্রমাণ করে যে, জনগণের ভোটাধিকার হরণ করলে তার পরিণতি হয় ভয়াবহ।
                        </p>
                    </div>

                    {/* References */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-500 dark:text-gray-500">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">মূল তথ্যসূত্র ও রেফারেন্স:</h4>
                        <p>
                            LSE South Asia Centre, V-Dem Institute Democracy Reports, BRUR Comparative Analysis of Electoral Integrity, Gallup Pakistan Election Reports, Dhaka Tribune Election History, Amnesty International & Human Rights Watch Reports (2024-2025). বিস্তারিত তালিকা মূল নথিতে সংরক্ষিত।
                        </p>
                    </div>

                </div>
            </article>
        </div>
    )
}
