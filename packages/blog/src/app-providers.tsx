import { ChakraProvider } from '@chakra-ui/react'
import type { EmotionCache } from '@emotion/react'
import { CacheProvider } from '@emotion/react'
import { emotionTheme } from '@whe/common'
import { AppProps } from 'next/app'
import { ReactNode, useState } from 'react'
import { DefaultOptions, Hydrate, MutationCache, QueryCache, QueryClient, QueryClientProvider } from 'react-query'

import { createEmotionCache } from '@/core/nextjs/create-emotion-cache'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

type AppProvidersProps = {
  children: ReactNode
  emotionCache?: EmotionCache
  globalProps?: GlobalProps
  pageProps?: AppProps['pageProps']
  queryClientConfig?: {
    queryCache?: QueryCache
    mutationCache?: MutationCache
    defaultOptions?: DefaultOptions
  }
}

export const AppProviders = ({
  children,
  emotionCache = clientSideEmotionCache,
  globalProps,
  pageProps,
  queryClientConfig,
}: AppProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))
  return (
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={emotionTheme}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={globalProps?.dehydratedState}>
            <Hydrate state={pageProps?.dehydratedState}>{children}</Hydrate>
          </Hydrate>
        </QueryClientProvider>
      </ChakraProvider>
    </CacheProvider>
  )
}
