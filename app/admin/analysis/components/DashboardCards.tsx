
import React from 'react';
import { Users, Skull, Activity, AlertTriangle, ShieldAlert, HeartCrack, Flame, Gavel, Bomb, HelpCircle } from 'lucide-react';

interface Stats {
    total: number;
    killed: number;
    injured: number;
    political: number;
    mob: number;
    communal: number;
    gender: number;
    criminal: number;
    terrorism: number;
}

interface DashboardCardsProps {
    stats: Stats;
    onCardClick: (metric: string) => void;
}

export default function DashboardCards({ stats, onCardClick }: DashboardCardsProps) {
    const mainCards = [
        {
            key: 'total',
            label: 'Total Incidents',
            value: stats.total,
            icon: Activity,
            color: 'teal',
            desc: 'Detected Events',
            main: true
        },
        {
            key: 'killed',
            label: 'Total Deaths',
            value: stats.killed,
            icon: Skull,
            color: 'red',
            desc: 'Lives Lost',
            main: true
        },
        {
            key: 'injured',
            label: 'Total Injured',
            value: stats.injured,
            icon: Users,
            color: 'orange',
            desc: 'People Hurt',
            main: true
        }
    ];

    const categoryCards = [
        {
            key: 'political',
            label: 'Political Violence',
            value: stats.political,
            icon: AlertTriangle,
            color: 'blue',
            desc: 'Party Clashes'
        },
        {
            key: 'mob',
            label: 'Mob Justice',
            value: stats.mob,
            icon: ShieldAlert,
            color: 'amber',
            desc: 'Lynchings'
        },
        {
            key: 'communal',
            label: 'Communal / Religious',
            value: stats.communal,
            icon: Flame,
            color: 'indigo',
            desc: 'Religious Attacks'
        },
        {
            key: 'gender',
            label: 'Gender Violence',
            value: stats.gender,
            icon: HeartCrack,
            color: 'pink',
            desc: 'Rape / Abuse'
        },
        {
            key: 'criminal',
            label: 'Criminal Violence',
            value: stats.criminal,
            icon: Gavel,
            color: 'slate',
            desc: 'Gang / Robbery / Others'
        },
        {
            key: 'terrorism',
            label: 'Terrorism',
            value: stats.terrorism,
            icon: Bomb,
            color: 'zinc',
            desc: 'Extremist Attacks'
        }
    ];

    const colorClasses: Record<string, string> = {
        teal: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
        red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
        orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
        pink: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
        slate: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
        zinc: 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-200',
        gray: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    };

    const renderCard = (card: any) => {
        const Icon = card.icon;
        const baseClass = colorClasses[card.color] || colorClasses['gray'];
        return (
            <div
                key={card.key}
                onClick={() => onCardClick(card.key)}
                className={`
                    relative p-5 rounded-xl border transition-all duration-200 cursor-pointer
                    hover:shadow-md hover:-translate-y-1 group
                    ${baseClass}
                `}
            >
                <div className="flex justify-between items-start mb-2">
                    <Icon className="h-6 w-6 opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">
                    {card.value.toLocaleString()}
                </div>
                <div className="text-sm font-medium opacity-80">
                    {card.label}
                </div>
                <div className="mt-2 text-xs opacity-60">
                    {card.desc}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 mb-8">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mainCards.map(renderCard)}
            </div>

            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                Violence Categories
            </h3>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {categoryCards.map(renderCard)}
            </div>
        </div>
    );
}
