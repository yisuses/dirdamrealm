import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { BlogPosting } from 'schema-dts'

const { publicRuntimeConfig } = getConfig()

export function Metadata({ name, description, imageUrl, ldJson }: MetaDataProps) {
  const { t } = useTranslation('common')
  const { asPath } = useRouter()

  const title = `${t('pageTitle')} - ${name}`
  const ogImage = imageUrl ? imageUrl : `${publicRuntimeConfig.BASE_URL}/images/WE-logo-DESKTOP_WHITE.svg`

  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      <meta property="og:title" key="og:title" content={title} />
      <meta property="og:image" key="og:image" content={ogImage} />
      <meta property="og:description" key="og:description" content={description} />
      <meta property="og:type" key="og:type" content="website" />
      <meta property="og:url" key="og:url" content={`${publicRuntimeConfig.BASE_URL}${asPath}`} />
      <meta name="keywords" content="football, travel, work, life, balance, music, politics, news" />
      <link rel="icon" href="/favicon.ico" />
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
  ldJson?: BlogPosting
}
