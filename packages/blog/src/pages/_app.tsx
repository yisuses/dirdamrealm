import '@fontsource/spartan'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import type { AppContext, AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import NextNProgress from 'nextjs-progressbar'

import { getCategories, getAbout } from '@api'
import { MainLayout } from '@components'
import { AppProviders } from 'app-providers'

const queryClient = new QueryClient()

function BlogApp({ Component, pageProps, globalProps }: CustomAppProps) {
  return (
    <AppProviders globalProps={globalProps}>
      <MainLayout>
        <NextNProgress color="#F6AD55" options={{ showSpinner: false }} />
        <Component {...pageProps} globalProps={globalProps} />
      </MainLayout>
    </AppProviders>
  )
}

BlogApp.getInitialProps = async (appContext: AppContext): Promise<AppInitialProps> => {
  await queryClient.prefetchQuery(['categories'], () =>
    getCategories({ locale: appContext.router.locale as AppLocales }),
  )
  await queryClient.prefetchQuery(['about'], getAbout)

  return {
    globalProps: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default appWithTranslation(BlogApp)

export interface AppInitialProps {
  globalProps?: GlobalProps
}

export type CustomAppProps = AppProps & AppInitialProps
