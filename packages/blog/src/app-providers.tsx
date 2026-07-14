'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { Resource } from 'i18next'
import { I18nProvider } from 'next-i18next/client'
import { ReactNode } from 'react'

import { ColorModeProvider } from '@blog/components/ui/color-mode'
import { DEFAULT_LOCALE, LOCALES } from '@blog/core/i18n/config'
import { getQueryClient } from '@blog/core/query/get-query-client'
import system from '@blog/themes/chakra.theme'
import emotionTheme from '@blog/themes/emotion.theme'

type AppProvidersProps = {
  children: ReactNode
  lng: string
  resources: Resource
}

export const AppProviders = ({ children, lng, resources }: AppProvidersProps) => {
  const queryClient = getQueryClient()

  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <EmotionThemeProvider theme={emotionTheme}>
          <QueryClientProvider client={queryClient}>
            <I18nProvider
              language={lng}
              resources={resources}
              supportedLngs={[...LOCALES]}
              defaultNS="common"
              fallbackLng={DEFAULT_LOCALE}
            >
              {children}
            </I18nProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </EmotionThemeProvider>
      </ColorModeProvider>
    </ChakraProvider>
  )
}
