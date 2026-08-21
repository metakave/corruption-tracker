import React from 'react';

interface DateRangeFilterProps {
    startDate: string;
    endDate: string;
    onDateChange: (start: string, end: string) => void;
}

export default function DateRangeFilter({ startDate, endDate, onDateChange }: DateRangeFilterProps) {
    return (
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">From</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onDateChange(e.target.value, endDate)}
                    className="w-full p-1.5 border dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">To</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onDateChange(startDate, e.target.value)}
                    className="w-full p-1.5 border dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                />
            </div>
        </div>
    );
}
