import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { DehydratedState, HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppProps } from 'next/app'
import { ReactNode, useState } from 'react'

import { ColorModeProvider } from '@blog/components/ui/color-mode'
import system from '@blog/themes/chakra.theme'
import emotionTheme from '@blog/themes/emotion.theme'

type AppProvidersProps = {
  children: ReactNode
  globalProps?: GlobalProps
  pageProps?: AppProps<{ dehydratedState: DehydratedState }>['pageProps']
}

export const AppProviders = ({ children, globalProps, pageProps }: AppProvidersProps) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 24 * 3600 * 1000 } } }),
  )
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <EmotionThemeProvider theme={emotionTheme}>
          <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={globalProps?.dehydratedState}>
              <HydrationBoundary state={pageProps?.dehydratedState}>{children}</HydrationBoundary>
            </HydrationBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </EmotionThemeProvider>
      </ColorModeProvider>
    </ChakraProvider>
  )
}
