import { ChakraProvider } from '@chakra-ui/react'
import type { EmotionCache } from '@emotion/react'
import { CacheProvider } from '@emotion/react'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { createEmotionCache } from '@/core/nextjs/create-emotion-cache'
import { chakraTheme } from '@/themes/chakra.theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

type AppProvidersProps = {
  children: ReactNode
  emotionCache?: EmotionCache
}

export const AppProviders = ({ children, emotionCache = clientSideEmotionCache }: AppProvidersProps) => {
  return (
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={chakraTheme}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ChakraProvider>
    </CacheProvider>
  )
}
