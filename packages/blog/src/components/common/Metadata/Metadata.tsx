import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { BlogPosting, ItemList, WebPage } from 'schema-dts'

import { useGetLocalePublicUrl } from '@hooks/useGetLocalePublicUrl'

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
  const getLocalePublicUrl = useGetLocalePublicUrl()
  const { asPath } = useRouter()

  const title = `${t('pageTitle')} - ${name}`
  const ogImage = imageUrl || `${publicRuntimeConfig.BASE_URL}/images/WElogo.png`

  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/favicon.ico" />

      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <meta itemProp="image" content={ogImage} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:locale:alternate" content="en_GB" />

      <meta property="og:site_name" key="og:site_name" content="White emotion" />
      <meta property="og:url" key="og:url" content={getLocalePublicUrl(asPath)} />
      <meta property="og:title" key="og:title" content={title} />
      <meta property="og:image" key="og:image" content={ogImage} />
      <meta property="og:description" key="og:description" content={description} />
      <meta property="og:type" key="og:type" content={type} />
      <meta name="keywords" content={keywords} />
      {extraMetaTags.map(({ name, content }) => (
        <meta key={name} name={name} content={content} />
      ))}

      {ldJson &&
        ldJson.map((ldJsonItem, index) => (
          <script
            key={`ldJson-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org/',
                ...ldJsonItem,
              }),
            }}
          />
        ))}
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
  ldJson?: (WebPage | BlogPosting | ItemList)[]
}
