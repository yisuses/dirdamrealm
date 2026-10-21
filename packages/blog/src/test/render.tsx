/// <reference types="vite/client" />
import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type RenderOptions, render, renderHook } from '@testing-library/react'
import { type Resource, createInstance } from 'i18next'
import type { ReactElement, ReactNode } from 'react'
import { I18nextProvider, initReactI18next } from 'react-i18next'

import { DEFAULT_LOCALE, LOCALES } from '@blog/core/i18n/config'
import system from '@blog/themes/chakra.theme'
import emotionTheme from '@blog/themes/emotion.theme'

const localeFiles = import.meta.glob<{ default: Record<string, unknown> }>('../../public/locales/*/*.json', {
  eager: true,
})

// Real translations, so tests and snapshots show the copy users see.
const resources = Object.entries(localeFiles).reduce<Resource>((acc, [file, module]) => {
  const [, lng, ns] = file.match(/locales\/(\w+)\/(\w+)\.json$/)!
  acc[lng] = { ...acc[lng], [ns]: module.default }
  return acc
}, {})

export function createTestI18n(lng: AppLocales = DEFAULT_LOCALE) {
  const instance = createInstance()
  instance.use(initReactI18next).init({
    lng,
    resources,
    supportedLngs: [...LOCALES],
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    initAsync: false,
  })
  return instance
}

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })
}

interface ProviderOptions {
  lng?: AppLocales
  queryClient?: QueryClient
}

function createWrapper({ lng = DEFAULT_LOCALE, queryClient = createTestQueryClient() }: ProviderOptions) {
  const i18n = createTestI18n(lng)
  return function Providers({ children }: { children: ReactNode }) {
    return (
      <ChakraProvider value={system}>
        <EmotionThemeProvider theme={emotionTheme}>
          <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
          </QueryClientProvider>
        </EmotionThemeProvider>
      </ChakraProvider>
    )
  }
}

/**
 * Renders inside the app's providers: Chakra, Emotion, React Query and i18n. The color-mode
 * provider is left out because next-themes injects a <script> into the output; without it
 * `useColorMode` resolves to light, the app's default.
 */
export function renderWithProviders(ui: ReactElement, options: ProviderOptions & RenderOptions = {}) {
  const { lng, queryClient, ...renderOptions } = options
  return render(ui, { wrapper: createWrapper({ lng, queryClient }), ...renderOptions })
}

export function renderHookWithProviders<Result>(hook: () => Result, options: ProviderOptions = {}) {
  return renderHook(hook, { wrapper: createWrapper(options) })
}
