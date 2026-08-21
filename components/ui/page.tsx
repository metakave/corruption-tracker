'use client'

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Database, Search, Users, ExternalLink, Globe } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl font-bengali">
            {/* Header Section */}
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-900 dark:from-red-400 dark:to-red-600 bg-clip-text text-transparent">
                    আমাদের সম্পর্কে
                </h1>
                <p className="text-xl text-muted-foreground dark:text-gray-200">
                    প্রযুক্তির ব্যবহারে নিরাপদ সমাজ গড়ার অঙ্গীকার
                </p>
                <Separator className="my-6 bg-border dark:bg-slate-700" />
                <p className="text-lg text-muted-foreground dark:text-gray-200 leading-relaxed max-w-2xl mx-auto">
                    ViolenceTracker.org কেবল একটি প্রযুক্তিগত প্ল্যাটফর্ম নয়, এটি একটি সমাজসচেতন ও জনকল্যাণমুখী উদ্যোগ।
                    আমাদের মূল লক্ষ্য হলো—প্রযুক্তির সঠিক ব্যবহারের মাধ্যমে সহিংসতার স্বচ্ছ চিত্র তুলে ধরা এবং সমাজে জবাবদিহিতা নিশ্চিত করা।
                </p>
            </div>

            {/* Who We Are Section */}
            <section className="mb-16">
                <div className="bg-card dark:bg-slate-900/50 rounded-xl p-8 border dark:border-slate-800 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 dark:text-white">
                        <Users className="h-6 w-6 text-primary dark:text-primary" />
                        আমাদের পরিচয়
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground dark:text-gray-200 mb-8">
                        আমরা শুধুই প্রযুক্তিপ্রেমী নই, আমরা একদল সমাজসচেতন উদ্যোক্তা এবং অ্যাক্টিভিস্ট।
                        আমরা বিশ্বাস করি, তথ্যের অবাধ প্রবাহ ও সঠিক বিশ্লেষণই পারে সহিংসতা কমাতে।
                        স্বচ্ছতা ও আস্থার প্রতীক হিসেবে আমরা আমাদের পরিচয় উন্মুক্ত রেখেছি, যাতে সাধারণ মানুষ আমাদের ওপর ভরসা রাখতে পারেন।
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                        {/* Member 1: Musfiqur Tuhin */}
                        <div className="flex flex-col items-center text-center p-6 bg-background dark:bg-slate-800 rounded-lg border dark:border-slate-700 hover:bg-zinc-50 dark:hover:bg-slate-700/50 transition-colors duration-300">
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
                                <a href="https://musfiqurtuhin.me" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    মোঃ মুশফিকুর রহমান (তুহিন)
                                </a>
                            </h3>
                            <p className="text-sm font-medium text-primary dark:text-blue-400">ফাউন্ডার, লিড ডেভেলপার</p>
                        </div>

                        {/* Member 2: Sadiq M Alan */}
                        <div className="flex flex-col items-center text-center p-6 bg-background dark:bg-slate-800 rounded-lg border dark:border-slate-700 hover:bg-zinc-50 dark:hover:bg-slate-700/50 transition-colors duration-300">
                            <div className="w-32 h-32 rounded-full bg-slate-200 mb-4 overflow-hidden border-4 border-primary/10">
                                <img
                                    src="/images/sadiq.jpg"
                                    alt="Sadiq M Alan"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Sadiq+M+Alan&background=random&size=128"
                                    }}
                                />
                            </div>
                            <h3 className="text-xl font-bold dark:text-white">সাদিক এম আলম</h3>
                            <p className="text-sm font-medium text-primary dark:text-blue-400">কো-ফাউন্ডার</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What is Violence Tracker */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 dark:text-white">
                    <ShieldCheck className="h-6 w-6 text-primary dark:text-primary" />
                    ViolenceTracker.org কী?
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground dark:text-gray-200 leading-relaxed">
                    <p>
                        এটি একটি স্বয়ংক্রিয় পলিটিক্যাল ভায়োলেন্স ট্র্যাকিং সিস্টেম। আমাদের উদ্দেশ্য বাংলাদেশে রাজনৈতিক সহিংসতার
                        একটি সম্পূর্ণ নিরপেক্ষ ও স্বচ্ছ চিত্র উপস্থাপন করা। আমরা কোনো নির্দিষ্ট রাজনৈতিক দলের প্রতি পক্ষপাতদুষ্ট নই;
                        আমাদের পুরো প্রক্রিয়াটি ১০০% ডাটা-ড্রিভেন (Data Driven) বা উপাত্ত-নির্ভর।
                    </p>

                    <h3 className="text-xl font-semibold text-foreground dark:text-white mt-8 mb-4">আমাদের কর্মপদ্ধতি</h3>
                    <p className="mb-4">আমাদের সিস্টেমটি তিনটি প্রধান ধাপে কাজ করে, যেখানে মানুষের কোনো হস্তক্ষেপ নেই:</p>

                    <div className="grid md:grid-cols-3 gap-4">
                        <Card className="p-6 bg-background/50 dark:bg-slate-800/50 dark:border-slate-700">
                            <div className="font-bold text-primary dark:text-blue-400 text-xl mb-2">১. স্বয়ংক্রিয় তথ্য সংগ্রহ</div>
                            <p className="text-sm dark:text-gray-300">
                                (Automated Data Aggregation): আমাদের সিস্টেম দেশের শীর্ষস্থানীয় জাতীয় দৈনিক ও নির্ভরযোগ্য অনলাইন পোর্টালসমূহ
                                থেকে গত ২৪ ঘণ্টার সমস্ত সংবাদ স্বয়ংক্রিয়ভাবে সংগ্রহ করে।
                            </p>
                        </Card>
                        <Card className="p-6 bg-background/50 dark:bg-slate-800/50 dark:border-slate-700">
                            <div className="font-bold text-primary dark:text-blue-400 text-xl mb-2">২. বিশাল তথ্য ভান্ডার</div>
                            <p className="text-sm dark:text-gray-300">
                                (Big Data Processing): প্রতিদিন প্রায় ১০০০-এর বেশি সংবাদ আমাদের সিস্টেমে জমা হয়।
                                এই বিশাল ডাটাবেস তৈরির পুরো প্রক্রিয়াটি মানুষের হস্তক্ষেপমুক্ত এবং স্বয়ংক্রিয়।
                            </p>
                        </Card>
                        <Card className="p-6 bg-background/50 dark:bg-slate-800/50 dark:border-slate-700">
                            <div className="font-bold text-primary dark:text-blue-400 text-xl mb-2">৩. AI বিশ্লেষণ</div>
                            <p className="text-sm dark:text-gray-300">
                                সংগৃহীত সংবাদগুলো বিশ্লেষণ করে <strong className="text-foreground dark:text-white">অত্যাধুনিক লার্জ ল্যাঙ্গুয়েজ মডেল (LLM) ও জেনারেটিভ এআই প্রযুক্তি</strong>। এটি সংবাদের বিষয়বস্তু পড়ে
                                স্বয়ংক্রিয়ভাবে সহিংসতা শনাক্ত করে এবং ডাটাবেসে সংরক্ষণ করে।
                            </p>
                        </Card>
                    </div>

                    <p className="italic text-base bg-yellow-500/10 dark:bg-yellow-900/20 p-4 rounded-md border-l-4 border-yellow-500 mt-6 dark:text-gray-100">
                        "স্বয়ংক্রিয়ভাবে সংগৃহীত ডাটা আমাদের অ্যালগরিদম দ্বারা প্রসেস করা হয় এবং নিয়মিত মান উন্নয়নের চেষ্টা করা হয়।"
                    </p>
                </div>
            </section>

            {/* Use Cases */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 dark:text-white">
                    <Database className="h-6 w-6 text-primary dark:text-primary" />
                    ব্যবহার ও উপযোগিতা
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex gap-4 items-start p-4 rounded-lg bg-card dark:bg-slate-900 border dark:border-slate-800">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                            <Search className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1 dark:text-white">গবেষক</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                রাজনৈতিক সহিংসতা নিয়ে যেকোনো গবেষণার জন্য আমাদের ডাটাবেস একটি উন্মুক্ত ও নির্ভরযোগ্য উৎস।
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-lg bg-card dark:bg-slate-900 border dark:border-slate-800">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1 dark:text-white">রাজনৈতিক দল</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                দলগুলো তাদের সাংগঠনিক ভাবমূর্তি পর্যবেক্ষণ করতে পারবে এবং স্থানীয় পর্যায়ে সহিংসতা রোধে কার্যকর ব্যবস্থা নিতে পারবে।
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-lg bg-card dark:bg-slate-900 border dark:border-slate-800">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600 dark:text-purple-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1 dark:text-white">মানবাধিকার সংস্থা</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                হিউম্যান রাইটস ওয়াচ বা অন্যান্য এনজিওগুলো মানবাধিকার লঙ্ঘনের ঘটনাগুলো নিখুঁতভাবে ট্র্যাক করতে পারবে।
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-lg bg-card dark:bg-slate-900 border dark:border-slate-800">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400">
                            <ExternalLink className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1 dark:text-white">আইনশৃঙ্খলা বাহিনী</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                দেশের হটস্পটগুলো চিহ্নিত করতে এবং ভবিষ্যৎ নীতিনির্লাধরণে পলিসি মেকার ও বিশ্লেষকদের জন্য আমাদের রিপোর্ট সহায়ক ভূমিকা পালন করবে।
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-lg bg-card dark:bg-slate-900 border dark:border-slate-800 md:col-span-2">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full text-orange-600 dark:text-orange-400">
                            <Globe className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1 dark:text-white">সাধারণ জনগণ</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                আপনার এলাকার বর্তমান পরিস্থিতি জানুন এবং সংশ্লিষ্ট রাজনৈতিক দল ও প্রশাসনকে জবাবদিহিতার আওতায় আনুন।
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Citation Policy */}
            <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-xl text-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-2 dark:text-white">ডাটা ব্যবহারের শর্তাবলী</h3>
                <p className="text-muted-foreground dark:text-gray-300 mb-4">
                    আমাদের সাইটের যেকোনো ডাটা, গ্রাফ বা রিপোর্ট গবেষণার কাজে ব্যবহার করা যাবে, তবে সোর্স হিসেবে অবশ্যই উল্লেখ করতে হবে:
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
