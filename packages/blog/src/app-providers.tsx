import { ChakraProvider } from '@chakra-ui/provider'
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppProps } from 'next/app'
import { ReactNode, useState } from 'react'
import emotionTheme from '@themes/emotion.theme'

type AppProvidersProps = {
  children: ReactNode
  globalProps?: GlobalProps
  pageProps?: AppProps<{ dehydratedState: unknown }>['pageProps']
}

export const AppProviders = ({ children, globalProps, pageProps }: AppProvidersProps) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 24 * 3600 * 1000 } } }),
  )
  return (
    <ChakraProvider theme={emotionTheme}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={globalProps?.dehydratedState}>
          <Hydrate state={pageProps?.dehydratedState}>{children}</Hydrate>
        </Hydrate>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ChakraProvider>
  )
}
