/* eslint-disable @typescript-eslint/naming-convention */
import type { Metadata } from 'next'

import { DEFAULT_LOCALE, LOCALES } from '@blog/core/i18n/config'
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
  /** The page's own picture for link previews; the site's card when absent. */
  imageUrl?: string | { url: string; width: number; height: number; alt?: string }
  /** The language the page is written in, when it differs from the url's (a post with no translation). */
  canonicalLng?: AppLocales
  /** The page's path (without locale prefix) in each language it exists in; every language by default. */
  languages?: Partial<Record<AppLocales, string>>
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
  const prefix = (locale: AppLocales) => (locale === DEFAULT_LOCALE ? '' : `/${locale}`)
  // The page's one address, which Google is told to index: a post read under the other
  // language's prefix points at its own.
  const url = publicUrl(`${prefix(opts.canonicalLng ?? lng)}${path}`)
  const languagePaths = opts.languages ?? Object.fromEntries(LOCALES.map(locale => [locale, path]))
  const languages = Object.fromEntries(
    Object.entries(languagePaths).map(([locale, localePath]) => [
      locale,
      publicUrl(`${prefix(locale as AppLocales)}${localePath}`),
    ]),
  )
  // Pages without a photo of their own share the site's card, with the tagline in their language.
  const ogImage = imageUrl || {
    url: publicUrl(lng === 'en' ? '/images/og-default-en.png' : '/images/og-default.png'),
    width: 1200,
    height: 630,
  }

  const openGraph: NonNullable<Metadata['openGraph']> = {
    siteName: 'White Emotion',
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
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-icon.png',
    },
    manifest: '/manifest.webmanifest',
    alternates: { canonical: url, languages },
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
