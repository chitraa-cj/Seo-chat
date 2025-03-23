'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Force light theme on initial load
  React.useEffect(() => {
    // Set to light theme immediately
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        <NextThemesProvider {...props} forcedTheme="light">
          {children}
        </NextThemesProvider>
      </div>
    )
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
