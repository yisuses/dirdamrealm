import '@fontsource/roboto'
import '@fontsource/lora'
import '@fontsource/spartan'
import { appWithTranslation } from 'next-i18next'
import type { AppContext, AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import { dehydrate, QueryClient } from 'react-query'

import { getCategories, getAbout } from '@api'
import { MainLayout } from '@components'
import { AppProviders } from 'app-providers'

const queryClient = new QueryClient()

function App({ Component, pageProps, globalProps }: CustomAppProps) {
  return (
    <AppProviders globalProps={globalProps}>
      <MainLayout>
        <NextNProgress options={{ showSpinner: false }} />
        <Component {...pageProps} globalProps={globalProps} />
      </MainLayout>
    </AppProviders>
  )
}

App.getInitialProps = async ({ router }: AppContext): Promise<AppInitialProps> => {
  await queryClient.prefetchQuery(['categories'], () => getCategories({ locale: router.locale as AppLocales }))
  await queryClient.prefetchQuery(['about'], getAbout)

  return {
    globalProps: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default appWithTranslation(App)

export interface AppInitialProps {
  globalProps: GlobalProps
}

export type CustomAppProps = AppProps & AppInitialProps
