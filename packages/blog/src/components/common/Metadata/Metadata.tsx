import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { BlogPosting } from 'schema-dts'

import { blogUrl } from '@utils'

const { publicRuntimeConfig } = getConfig()

export function Metadata({
  name,
  description,
  imageUrl,
  type = 'website',
  keywords = 'football,travel,work,life,balance,music,politics,news',
  extraMetaTags = [],
  ldJson,
}: MetaDataProps) {
  const { t } = useTranslation('common')
  const { asPath, locale } = useRouter()

  const title = `${t('pageTitle')} - ${name}`
  const ogImage = imageUrl ? imageUrl : `${publicRuntimeConfig.BASE_URL}/images/WE-logo-DESKTOP_WHITE.svg`

  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/favicon.ico" />

      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="apple-mobile-web-app-capable" content="yes" />

      <meta property="og:site_name" key="og:site_name" content="White emotion" />
      <meta property="og:url" key="og:url" content={blogUrl(asPath, locale as string)} />
      <meta property="og:title" key="og:title" content={title} />
      <meta property="og:image" key="og:image" content={ogImage} />
      <meta property="og:description" key="og:description" content={description} />
      <meta property="og:type" key="og:type" content={type} />
      <meta name="keywords" content={keywords} />
      {extraMetaTags.map(({ name, content }) => (
        <meta key={name} name={name} content={content} />
      ))}

      {ldJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              ...ldJson,
            }),
          }}
        />
      )}
    </Head>
  )
}

export interface MetaDataProps {
  name: string
  description: string
  imageUrl?: string
  type?: string
  keywords?: string
  extraMetaTags?: { name: string; content: string }[]
  ldJson?: BlogPosting
}
