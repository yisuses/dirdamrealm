'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'

import { EmotionRegistry } from '@blog/components/admin/EmotionRegistry/EmotionRegistry'
import system from '@blog/themes/chakra.theme'
import emotionTheme from '@blog/themes/emotion.theme'

/**
 * The site's theme for the admin panel, always light: no next-themes provider (it injects a
 * <script> React warns about) and no i18n, the panel is in Spanish only.
 */
export function AdminProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>
        <EmotionThemeProvider theme={emotionTheme}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </EmotionThemeProvider>
      </ChakraProvider>
    </EmotionRegistry>
  )
}
