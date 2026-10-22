'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'

import { ColorModeProvider } from '@blog/components/ui/color-mode'
import system from '@blog/themes/chakra.theme'
import emotionTheme from '@blog/themes/emotion.theme'

/** The site's theme for the admin panel; no i18n, the panel is in Spanish only. */
export function AdminProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <EmotionThemeProvider theme={emotionTheme}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </EmotionThemeProvider>
      </ColorModeProvider>
    </ChakraProvider>
  )
}
