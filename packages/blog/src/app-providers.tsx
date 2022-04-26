import { ChakraProvider } from '@chakra-ui/react'
import { emotionTheme } from '@whe/common'
import { AppProps } from 'next/app'
import { ReactNode, useState } from 'react'
import { DefaultOptions, Hydrate, MutationCache, QueryCache, QueryClient, QueryClientProvider } from 'react-query'

type AppProvidersProps = {
  children: ReactNode
  globalProps?: GlobalProps
  pageProps?: AppProps['pageProps']
  queryClientConfig?: {
    queryCache?: QueryCache
    mutationCache?: MutationCache
    defaultOptions?: DefaultOptions
  }
}

export const AppProviders = ({ children, globalProps, pageProps, queryClientConfig }: AppProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))
  return (
    <ChakraProvider theme={emotionTheme}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={globalProps?.dehydratedState}>
          <Hydrate state={pageProps?.dehydratedState}>{children}</Hydrate>
        </Hydrate>
      </QueryClientProvider>
    </ChakraProvider>
  )
}
