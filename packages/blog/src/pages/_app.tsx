import '@fontsource/spartan'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import type { AppContext, AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import NextNProgress from 'nextjs-progressbar'

import { getCategories, getAbout } from '@api'
import { MainLayout } from '@components'
import { QUERY_ABOUT, QUERY_CATEGORIES } from '@utils/constants'
import { AppProviders } from 'app-providers'

function BlogApp({ Component, pageProps, globalProps }: CustomAppProps) {
  return (
    <AppProviders globalProps={globalProps} pageProps={pageProps}>
      <MainLayout>
        <NextNProgress color="#F6AD55" options={{ showSpinner: false }} />
        <Component {...pageProps} />
      </MainLayout>
    </AppProviders>
  )
}

BlogApp.getInitialProps = async (appContext: AppContext): Promise<AppInitialProps> => {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(QUERY_CATEGORIES, () =>
    getCategories({ locale: appContext.router.locale as AppLocales }),
  )
  await queryClient.prefetchQuery(QUERY_ABOUT, getAbout)

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
