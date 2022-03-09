import { ChakraProvider } from '@chakra-ui/react'
import type { EmotionCache } from '@emotion/react'
import { CacheProvider } from '@emotion/react'
import type { FC } from 'react'
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

type Props = {
  emotionCache?: EmotionCache
}

export const AppProviders: FC<Props> = props => {
  const { emotionCache = clientSideEmotionCache } = props
  return (
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={chakraTheme}>
        <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
      </ChakraProvider>
    </CacheProvider>
  )
}
