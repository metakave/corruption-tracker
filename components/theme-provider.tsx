'use client'

import * as React from 'react'

export type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
    resolvedTheme: 'dark' | 'light'
}

const initialState: ThemeProviderState = {
    theme: 'system',
    setTheme: () => null,
    resolvedTheme: 'light',
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'pv-theme',
    ...props
}: ThemeProviderProps) {
    const [theme, setThemeState] = React.useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey) as Theme
            if (stored === 'dark' || stored === 'light' || stored === 'system') {
                return stored
            }
        }
        return defaultTheme
    })

    const [resolvedTheme, setResolvedTheme] = React.useState<'dark' | 'light'>('light')

    React.useEffect(() => {
        const root = window.document.documentElement
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const applyTheme = (currentTheme: Theme) => {
            root.classList.remove('light', 'dark')
            let effective: 'dark' | 'light' = 'light'

            if (currentTheme === 'system') {
                effective = mediaQuery.matches ? 'dark' : 'light'
            } else {
                effective = currentTheme
            }

            root.classList.add(effective)
            setResolvedTheme(effective)
        }

        applyTheme(theme)

        const handleSystemChange = () => {
            if (theme === 'system') {
                applyTheme('system')
            }
        }

        mediaQuery.addEventListener('change', handleSystemChange)
        return () => mediaQuery.removeEventListener('change', handleSystemChange)
    }, [theme])

    const setTheme = (newTheme: Theme) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, newTheme)
        }
        setThemeState(newTheme)
    }

    return (
        <ThemeProviderContext.Provider {...props} value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = React.useContext(ThemeProviderContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
