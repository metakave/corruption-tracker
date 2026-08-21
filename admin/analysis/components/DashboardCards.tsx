
import React from 'react';
import { Users, Skull, Activity, AlertTriangle, ShieldAlert, HeartCrack } from 'lucide-react';

interface Stats {
    total: number;
    killed: number;
    injured: number;
    political: number;
    mob: number;
    gender: number;
}

interface DashboardCardsProps {
    stats: Stats;
    onCardClick: (metric: 'total' | 'killed' | 'injured' | 'political' | 'mob' | 'gender') => void;
}

export default function DashboardCards({ stats, onCardClick }: DashboardCardsProps) {
    const cards = [
        {
            key: 'total',
            label: 'Total Incidents',
            value: stats.total,
            icon: Activity,
            color: 'teal',
            desc: 'Detected Events'
        },
        {
            key: 'killed',
            label: 'Total Deaths',
            value: stats.killed,
            icon: Skull,
            color: 'red',
            desc: 'Lives Lost'
        },
        {
            key: 'injured',
            label: 'Total Injured',
            value: stats.injured,
            icon: Users,
            color: 'orange',
            desc: 'People Hurt'
        },
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
            desc: 'Public Lynchings'
        },
        {
            key: 'gender',
            label: 'Gender Violence',
            value: stats.gender,
            icon: HeartCrack,
            color: 'purple',
            desc: 'Harassment/Rape'
        }
    ];

    const colorClasses: Record<string, string> = {
        teal: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
        red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
        orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {cards.map((card) => {
                const Icon = card.icon;
                const baseClass = colorClasses[card.color] || colorClasses['teal'];

                return (
                    <div
                        key={card.key}
                        onClick={() => onCardClick(card.key as any)}
                        className={`
                            relative p-5 rounded-xl border transition-all duration-200 cursor-pointer
                            hover:shadow-md hover:-translate-y-1 group
                            ${baseClass}
                        `}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <Icon className="h-6 w-6 opacity-80" />
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
                                Click to View
                            </span>
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
            })}
        </div>
    );
}
