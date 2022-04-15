import { appWithTranslation, useTranslation } from 'next-i18next'
import type { AppProps } from 'next/app'
import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'
import NextNProgress from 'nextjs-progressbar'
import { dehydrate, QueryClient } from 'react-query'

import { MainLayout } from '@/components/layout/MainLayout'
import { getCategories } from 'api'
import { AppProviders } from 'app-providers'

const { serverRuntimeConfig } = getConfig()
const queryClient = new QueryClient()

function App({ Component, pageProps, baseUrl, globalProps }: CustomAppProps) {
  const { asPath: currentPath } = useRouter()
  const { t } = useTranslation('common')

  return (
    <AppProviders globalProps={globalProps}>
      <Head>
        <title>{t('pageTitle')}</title>
        <meta name="description" content="Jose Madrid Blog" />
        <meta name="title" content={t('pageTitle')} />
        <meta property="og:title" key="og:title" content="White Emotion" />
        <meta property="og:url" key="og:url" content={`${baseUrl}${currentPath}`} />
        <meta name="keywords" content="football travel work life balance music politics news" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MainLayout>
        <NextNProgress options={{ showSpinner: false }} />
        <Component {...pageProps} globalProps={globalProps} />
      </MainLayout>
    </AppProviders>
  )
}

App.getInitialProps = async (): Promise<AppInitialProps> => {
  // get initial categories
  await queryClient.prefetchQuery('categories', () => getCategories())

  return {
    globalProps: {
      dehydratedState: dehydrate(queryClient),
    },
    baseUrl: serverRuntimeConfig.BASE_URL,
  }
}

export default appWithTranslation(App)

export interface AppInitialProps {
  globalProps: GlobalProps
  baseUrl: string
}

export type CustomAppProps = AppProps & AppInitialProps
