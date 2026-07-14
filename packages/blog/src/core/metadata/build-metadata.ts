/* eslint-disable @typescript-eslint/naming-convention */
import type { Metadata } from 'next'

import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'

const OG_LOCALE: Record<AppLocales, string> = { es: 'es_ES', en: 'en_GB' }
const DEFAULT_KEYWORDS = 'football,travel,work,life,balance,music,politics,news'

type BuildMetadataOptions = {
  lng: AppLocales
  /** Site title prefix, i.e. t('pageTitle'). */
  pageTitle: string
  /** Page-specific name appended after the site title. */
  name: string
  description: string
  /** Path WITHOUT the locale prefix, e.g. '' (home), '/archive/'. */
  path: string
  imageUrl?: string
  type?: 'website' | 'article'
  keywords?: string
  article?: { publishedTime?: string; modifiedTime?: string; section?: string; authors?: string[] }
  twitter?: { title?: string; description?: string; image?: string; imageAlt?: string; creator?: string }
}

/**
 * Builds a Next `Metadata` object equivalent to the old `<Metadata>` (next/head) component,
 * for use from `generateMetadata`. Locale-aware canonical/OG urls preserve the previous SEO.
 */
export function buildPageMetadata(opts: BuildMetadataOptions): Metadata {
  const { lng, pageTitle, name, description, path, imageUrl, type = 'website', keywords = DEFAULT_KEYWORDS } = opts

  const title = `${pageTitle} - ${name}`
  const localePrefix = lng === DEFAULT_LOCALE ? '' : `/${lng}`
  const url = publicUrl(`${localePrefix}${path}`)
  const ogImage = imageUrl || publicUrl('/images/WElogo.png')

  const openGraph: NonNullable<Metadata['openGraph']> = {
    siteName: 'White emotion',
    url,
    title,
    description,
    images: [ogImage],
    locale: OG_LOCALE[lng],
    alternateLocale: (Object.keys(OG_LOCALE) as AppLocales[]).filter(l => l !== lng).map(l => OG_LOCALE[l]),
    ...(type === 'article' ? { type: 'article', ...opts.article } : { type: 'website' }),
  }

  const metadata: Metadata = {
    title,
    description,
    keywords,
    icons: { icon: '/favicon.ico' },
    openGraph,
    other: { 'apple-mobile-web-app-capable': 'yes' },
  }

  if (opts.twitter) {
    metadata.twitter = {
      card: 'summary_large_image',
      title: opts.twitter.title || title,
      description: opts.twitter.description || description,
      images: opts.twitter.image ? [opts.twitter.image] : undefined,
      creator: opts.twitter.creator || undefined,
    }
  }

  return metadata
}
