import '@fontsource/spartan'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { AppProviders } from 'app-providers'
import { appWithTranslation } from 'next-i18next'
import type { AppContext, AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'

import { getAbout, getCategories } from '@blog/api'
import { MainLayout } from '@blog/components'
import { QUERY_ABOUT, QUERY_CATEGORIES } from '@blog/utils/constants'

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
  await queryClient.prefetchQuery({
    queryKey: QUERY_CATEGORIES,
    queryFn: () => getCategories({ locale: appContext.router.locale as AppLocales }),
  })
  await queryClient.prefetchQuery({
    queryKey: QUERY_ABOUT,
    queryFn: getAbout,
  })

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
