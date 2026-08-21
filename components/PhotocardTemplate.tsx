

import React from 'react';
import { Calendar, MapPin, Activity, ShieldAlert } from 'lucide-react';

interface PhotocardData {
    title: string;
    date: string;
    location: string;
    killed: string;
    injured: string;
    tags: string;
    sources: string;
    summary: string;
}

interface PhotocardTemplateProps {
    data: PhotocardData;
    theme?: 'classic' | 'dark' | 'crimson' | 'ocean' | 'newspaper';
    logoUrl?: string;
}

const themeConfig = {
    classic: {
        bg: 'bg-white',
        text: 'text-slate-900',
        border: 'border-slate-100',
        badge: 'bg-red-50 text-red-700 border border-red-100',
        logoBg: 'bg-white border-slate-100',
        metaBg: 'bg-slate-50',
        metaText: 'text-slate-600',
        metaIcon: 'text-red-500',
        summaryBg: 'bg-red-50',
        summaryText: 'text-slate-800',
        summaryBorder: 'border-red-100',
        summaryAccent: 'bg-red-600',
        statCard: 'bg-white border-slate-100 shadow-sm',
        statLabel: 'text-slate-500',
        statValueKilled: 'text-red-600',
        statValueInjured: 'text-orange-500',
        tagBg: 'bg-slate-100',
        tagText: 'text-slate-600',
        footer: 'text-red-600',
    },
    dark: {
        bg: 'bg-slate-900',
        text: 'text-white',
        border: 'border-slate-800',
        badge: 'bg-red-900/30 text-red-400 border border-red-900/50',
        logoBg: 'bg-white border-slate-700',
        metaBg: 'bg-slate-800',
        metaText: 'text-slate-400',
        metaIcon: 'text-red-400',
        summaryBg: 'bg-slate-800',
        summaryText: 'text-slate-300',
        summaryBorder: 'border-slate-700',
        summaryAccent: 'bg-red-500',
        statCard: 'bg-slate-800 border-slate-700',
        statLabel: 'text-slate-400',
        statValueKilled: 'text-red-500',
        statValueInjured: 'text-orange-400',
        tagBg: 'bg-slate-800',
        tagText: 'text-slate-400',
        footer: 'text-red-500',
    },
    crimson: {
        bg: 'bg-red-700',
        text: 'text-white',
        border: 'border-red-600',
        badge: 'bg-red-800 text-red-100 border border-red-600',
        logoBg: 'bg-white border-red-600',
        metaBg: 'bg-red-800',
        metaText: 'text-red-100',
        metaIcon: 'text-white',
        summaryBg: 'bg-red-800',
        summaryText: 'text-white',
        summaryBorder: 'border-red-600',
        summaryAccent: 'bg-white',
        statCard: 'bg-red-800 border-red-600',
        statLabel: 'text-red-200',
        statValueKilled: 'text-white',
        statValueInjured: 'text-orange-200',
        tagBg: 'bg-red-900',
        tagText: 'text-red-200',
        footer: 'text-white',
    },
    ocean: {
        bg: 'bg-sky-50',
        text: 'text-slate-900',
        border: 'border-sky-100',
        badge: 'bg-sky-100 text-sky-700 border border-sky-200',
        logoBg: 'bg-white border-sky-100',
        metaBg: 'bg-white',
        metaText: 'text-sky-800',
        metaIcon: 'text-sky-500',
        summaryBg: 'bg-white',
        summaryText: 'text-slate-700',
        summaryBorder: 'border-sky-200',
        summaryAccent: 'bg-sky-500',
        statCard: 'bg-white border-sky-200',
        statLabel: 'text-sky-500',
        statValueKilled: 'text-sky-700',
        statValueInjured: 'text-indigo-600',
        tagBg: 'bg-sky-100',
        tagText: 'text-sky-700',
        footer: 'text-sky-700',
    },
    newspaper: {
        bg: 'bg-[#f0f0eb]',
        text: 'text-black',
        border: 'border-stone-300',
        badge: 'bg-black text-white border border-black',
        logoBg: 'bg-transparent border-transparent grayscale',
        metaBg: 'bg-white border border-black',
        metaText: 'text-black',
        metaIcon: 'text-black',
        summaryBg: 'bg-white',
        summaryText: 'text-black',
        summaryBorder: 'border-black',
        summaryAccent: 'bg-black',
        statCard: 'bg-white border-2 border-black shadow-none',
        statLabel: 'text-black font-black',
        statValueKilled: 'text-black',
        statValueInjured: 'text-black',
        tagBg: 'bg-white border border-black',
        tagText: 'text-black',
        footer: 'text-black',
    }
};

export default function PhotocardTemplate({
    data,
    theme = 'classic',
    logoUrl = 'https://violencetracker.org/_next/image?url=%2Fimages%2Flogo-bn.png&w=3840&q=75'
}: PhotocardTemplateProps) {
    const t = themeConfig[theme];

    const getSummarySize = (text: string) => {
        const len = text.length;
        // Significantly reduced font sizes for more "breathing space"
        if (len < 100) return "text-3xl leading-relaxed";
        if (len < 200) return "text-2xl leading-relaxed";
        if (len < 350) return "text-xl leading-relaxed";
        if (len < 500) return "text-lg leading-relaxed";
        return "text-base leading-relaxed";
    };

    // Helper to strip HTML tags if present (basic)
    const cleanSummary = (text: string) => {
        return text.replace(/<[^>]*>/g, '');
    };

    return (
        <div
            className={`relative overflow-hidden ${t.bg}`}
            style={{
                width: '800px',
                height: '800px',
                fontFamily: '"Noto Serif Bengali", serif',
            }}
        >
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full p-12 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${t.badge}`}>
                        <div className="w-2 h-2 rounded-full animate-pulse bg-current"></div>
                        <span className="text-sm font-bold uppercase tracking-wider">Violence Tracker</span>
                    </div>
                    <div className={`w-24 h-12 rounded-lg shadow-sm flex items-center justify-center p-1 ${t.logoBg}`}>
                        <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-0 justify-center">
                    {/* Title */}
                    <h1 className={`text-4xl font-black leading-tight mb-8 shrink-0 text-center ${t.text}`}>
                        {data.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 mb-8 shrink-0 justify-center">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${t.metaBg}`}>
                            <Calendar size={18} className={t.metaIcon} />
                            <span className={`text-lg font-bold ${t.metaText}`}>{data.date}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${t.metaBg}`}>
                            <MapPin size={18} className={t.metaIcon} />
                            <span className={`text-lg font-bold ${t.metaText}`}>{data.location}</span>
                        </div>
                    </div>

                    {/* Summary - Increased padding and line height */}
                    <div className={`p-8 rounded-2xl border mb-8 relative flex items-center justify-center ${t.summaryBg} ${t.summaryBorder}`}>
                        <div className={`absolute top-0 left-0 w-2 h-full ${t.summaryAccent}`}></div>
                        <p className={`font-medium text-justify ${t.summaryText} ${getSummarySize(data.summary)}`}>
                            {cleanSummary(data.summary)}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="shrink-0 mt-auto">
                        <div className="grid grid-cols-2 gap-6">
                            <div className={`rounded-2xl p-5 border flex items-center justify-between ${t.statCard}`}>
                                <div>
                                    <p className={`text-lg font-bold uppercase tracking-wide ${t.statLabel}`}>নিহত</p>
                                    <h3 className={`text-5xl font-black ${t.statValueKilled}`}>{data.killed}</h3>
                                </div>
                                <ShieldAlert size={48} className={t.statValueKilled} strokeWidth={1.5} />
                            </div>
                            <div className={`rounded-2xl p-5 border flex items-center justify-between ${t.statCard}`}>
                                <div>
                                    <p className={`text-lg font-bold uppercase tracking-wide ${t.statLabel}`}>আহত</p>
                                    <h3 className={`text-5xl font-black ${t.statValueInjured}`}>{data.injured}</h3>
                                </div>
                                <Activity size={48} className={t.statValueInjured} strokeWidth={1.5} />
                            </div>
                        </div>
                        {/* Tags removed as requested */}
                    </div>
                </div>

                {/* Footer */}
                <div className={`mt-8 pt-4 border-t shrink-0 ${t.border}`}>
                    <div className="flex justify-between items-end">
                        <div className={`text-sm font-medium max-w-[70%] ${t.metaText}`}>
                            <span className="font-bold uppercase block mb-1 text-base opacity-70">সূত্র:</span>
                            <span className="line-clamp-1">{data.sources}</span>
                        </div>
                        <div className="text-right">
                            <p className={`font-black text-xl tracking-tight ${t.footer}`}>violencetracker.org</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
