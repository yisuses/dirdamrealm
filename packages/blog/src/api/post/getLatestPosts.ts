import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from '@blog/api/mapper'
import { LOCALES } from '@blog/core/i18n/config'
import { apiUrl, getLocalizedPosts } from '@blog/utils'

type GetLatestPostParams = {
  locale?: AppLocales
  category?: string
  limit?: number
  populate?: string[]
}

export async function getLatestPosts({
  category,
  limit,
  locale,
  populate,
}: GetLatestPostParams): Promise<Post[] | undefined> {
  const populateObject = (populate || ['categories', 'coverImage', 'localizations']).reduce<Record<string, boolean>>(
    (acc, key) => ({ ...acc, [key]: true }),
    {},
  )

  // Strapi v5 returns empty `localizations` when several locales are requested in one query,
  // which breaks the localized/fallback grouping. Fetch each locale separately instead.
  const buildQuery = (loc: AppLocales) =>
    stringify({
      sort: ['publishedAt:desc'],
      pagination: { pageSize: limit || 100, page: 1 },
      populate: populateObject,
      status: 'published',
      locale: loc,
      filters: {
        ...(category && { categories: { code: category } }),
      },
    })

  try {
    const responses = await Promise.all(
      LOCALES.map(loc => axios.get<PostResponse>(apiUrl(`/api/posts?${buildQuery(loc)}`))),
    )
    // Re-sort globally: per-locale fetches are each sorted, but the concatenation is not.
    const mappedPosts = responses
      .flatMap(({ data: response }) => response.data.map(postMapper))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    if (!locale) {
      return mappedPosts
    }

    return getLocalizedPosts(mappedPosts, locale)
  } catch (err) {
    console.error(err)
    throw new Error('Error retrieving latest posts.')
  }
}
