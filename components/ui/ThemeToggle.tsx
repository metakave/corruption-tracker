'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (

        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-gray-800 transition-all border border-transparent dark:border-gray-700 bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-300 relative h-9 w-9 flex items-center justify-center shrink-0"
            title="Toggle Theme"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
            <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )

}
