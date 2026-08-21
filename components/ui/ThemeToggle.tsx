'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = resolvedTheme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="h-9 w-9 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm focus:outline-none shrink-0 cursor-pointer"
            title={mounted ? (isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode') : 'Toggle Theme'}
            aria-label="Toggle light and dark theme"
        >
            {mounted ? (
                isDark ? (
                    <Sun className="h-4.5 w-4.5 text-amber-400 animate-in fade-in zoom-in duration-200" />
                ) : (
                    <Moon className="h-4.5 w-4.5 text-slate-700 animate-in fade-in zoom-in duration-200" />
                )
            ) : (
                <div className="h-4.5 w-4.5" />
            )}
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
