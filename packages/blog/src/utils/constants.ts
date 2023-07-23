/* eslint-disable @typescript-eslint/naming-convention */
import { QueryKey } from '@tanstack/react-query'

export const DATE_FORMAT = 'dd.MM.yyyy'

export const QUERY_ABOUT: QueryKey = ['about']
export const QUERY_CATEGORIES: QueryKey = ['categories']
export const getLatestPostsKey = (categoryCode = ''): QueryKey => ['latestPosts', categoryCode]
export const getCategoryCodeKey = (categoryCode: string): QueryKey => ['category', categoryCode]
export const getPostKey = (postId: number): QueryKey => ['post', postId]
export const getPostCommentsKey = (postIds: number[]): QueryKey => ['postComments', postIds.join()]
export const getAlgoliaPostKey = (debouncedValue: string): QueryKey => ['algoliaPosts', { debouncedValue }]

export const mapLocales: Record<AppLocales, string> = {
  en: 'en-US',
  es: 'es-ES',
}

export const xmlUrlSet = (content: string) => `
<urlset 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd"
  >
  ${content}
</urlset>
`
