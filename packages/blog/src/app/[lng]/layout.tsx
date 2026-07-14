import '@fontsource/spartan'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AppProviders } from 'app-providers'
import type { Viewport } from 'next'
import { generateI18nStaticParams } from 'next-i18next/server'
import Script from 'next/script'
import { ReactNode } from 'react'

import { getAbout, getCategories } from '@blog/api'
import { MainLayout } from '@blog/components'
import { getServerResources, getServerT } from '@blog/core/i18n/server'
import { getQueryClient } from '@blog/core/query/get-query-client'
import { CATEGORIES_STALE_TIME_MS, QUERY_ABOUT, getCategoriesKey } from '@blog/utils/constants'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export function generateStaticParams() {
  return generateI18nStaticParams()
}

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ lng: AppLocales }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { lng } = await params

  // Init server i18n + collect resources (all namespaces/locales are preloaded) for the client provider.
  const { i18n } = await getServerT(lng)
  const resources = getServerResources(i18n)

  // Global data used by the header/footer (categories + about), prefetched once here.
  const queryClient = getQueryClient()
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: getCategoriesKey(lng),
      queryFn: () => getCategories({ locale: lng }),
      staleTime: CATEGORIES_STALE_TIME_MS,
    }),
    queryClient.prefetchQuery({ queryKey: QUERY_ABOUT, queryFn: getAbout }),
  ])

  return (
    // suppressHydrationWarning: next-themes sets the color-mode class/style on <html> client-side.
    <html lang={lng} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProviders lng={lng} resources={resources}>
          <SpeedInsights />
          <HydrationBoundary state={dehydrate(queryClient)}>
            <MainLayout>{children}</MainLayout>
          </HydrationBoundary>
        </AppProviders>
        <div id="modal-root" />
        <Script async strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-GZ5NQYF1S9" />
        <Script
          id="G-GZ5NQYF1S9"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []
            function gtag(){window.dataLayer.push(arguments)}
            gtag('js', new Date()); gtag('config', 'G-GZ5NQYF1S9')`,
          }}
        />
      </body>
    </html>
  )
}
