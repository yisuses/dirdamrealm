import { describe, expect, it } from 'vitest'

import { buildPageMetadata } from './build-metadata'

const base = { pageTitle: 'White emotion', name: 'Archive', description: 'All posts', path: '/archive/' }

describe('buildPageMetadata', () => {
  it('should build website metadata for the default locale', () => {
    expect(buildPageMetadata({ ...base, lng: 'es' })).toEqual({
      title: 'White emotion - Archive',
      description: 'All posts',
      keywords: 'football,travel,work,life,balance,music,politics,news',
      icons: { icon: '/favicon.ico' },
      openGraph: {
        siteName: 'White emotion',
        url: 'https://example.com/archive/',
        title: 'White emotion - Archive',
        description: 'All posts',
        images: ['https://example.com/images/WElogo.png'],
        locale: 'es_ES',
        alternateLocale: ['en_GB'],
        type: 'website',
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      other: { 'apple-mobile-web-app-capable': 'yes' },
    })
  })

  it('should prefix the url and swap the og locales for a non-default locale', () => {
    const { openGraph } = buildPageMetadata({ ...base, lng: 'en' })

    expect(openGraph).toMatchObject({
      url: 'https://example.com/en/archive/',
      locale: 'en_GB',
      alternateLocale: ['es_ES'],
    })
  })

  it('should build article metadata with the given image and keywords', () => {
    const metadata = buildPageMetadata({
      ...base,
      lng: 'es',
      imageUrl: 'https://cdn.com/post.png',
      keywords: 'post',
      type: 'article',
      article: { publishedTime: '2026-01-01', authors: ['Saúl'] },
    })

    expect(metadata.keywords).toBe('post')
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      images: ['https://cdn.com/post.png'],
      publishedTime: '2026-01-01',
      authors: ['Saúl'],
    })
    expect(metadata.twitter).toBeUndefined()
  })

  it('should fill twitter metadata from its own values', () => {
    const { twitter } = buildPageMetadata({
      ...base,
      lng: 'es',
      twitter: { title: 'T', description: 'D', image: 'https://cdn.com/t.png', creator: '@saul' },
    })

    expect(twitter).toEqual({
      card: 'summary_large_image',
      title: 'T',
      description: 'D',
      images: ['https://cdn.com/t.png'],
      creator: '@saul',
    })
  })

  it('should fall back to the page values for missing twitter fields', () => {
    const { twitter } = buildPageMetadata({ ...base, lng: 'es', twitter: {} })

    expect(twitter).toEqual({
      card: 'summary_large_image',
      title: 'White emotion - Archive',
      description: 'All posts',
      images: undefined,
      creator: undefined,
    })
  })
})
