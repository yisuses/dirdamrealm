'use client'

import { ThemeProvider, ThemeProviderProps, useTheme } from 'next-themes'

// Chakra v3 delegates color mode to next-themes. This snippet re-exposes the v2-style
// useColorMode/useColorModeValue API so existing components only change their import.

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return <ThemeProvider attribute="class" disableTransitionOnChange defaultTheme="light" {...props} />
}

export type ColorMode = 'light' | 'dark'

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme } = useTheme()
  const colorMode = (resolvedTheme as ColorMode) ?? 'light'
  const toggleColorMode = () => setTheme(colorMode === 'dark' ? 'light' : 'dark')
  return {
    colorMode,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<Light, Dark>(light: Light, dark: Dark): Light | Dark {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? dark : light
}
