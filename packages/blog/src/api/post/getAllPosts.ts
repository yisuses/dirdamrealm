import axios from 'axios'
import { stringify } from 'qs'

import { safePostMapper } from '@blog/api/mapper'
import { LOCALES } from '@blog/core/i18n/config'
import { apiUrl, getLocalizedPosts } from '@blog/utils'

type GetAllPostParams = {
  locale?: AppLocales
  category?: string
}

export async function getAllPosts({ locale, category }: GetAllPostParams): Promise<Post[] | undefined> {
  // Strapi v5 returns empty `localizations` when several locales are requested in one query,
  // which breaks the localized/fallback grouping. Fetch each locale separately instead.
  const buildQuery = (loc: AppLocales) =>
    stringify({
      sort: ['updatedAt:desc'],
      status: 'published',
      populate: { localizations: true, coverImage: true },
      locale: loc,
      ...(category && { filters: { categories: { code: category } } }),
      pagination: { page: 1, pageSize: 100000 },
    })

  try {
    const responses = await Promise.all(
      LOCALES.map(loc => axios.get<PostResponse>(apiUrl(`/api/posts?${buildQuery(loc)}`))),
    )
    // Re-sort globally: per-locale fetches are each sorted, but the concatenation is not.
    // safePostMapper drops (and reports) any single malformed post rather than failing the batch.
    const mappedPosts = responses
      .flatMap(({ data: response }) => response.data.map(safePostMapper).filter((p): p is Post => p !== null))
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())

    if (!locale) {
      return mappedPosts
    }

    return getLocalizedPosts(mappedPosts, locale)
  } catch (err) {
    console.error(err)
    throw new Error('Error retrieving posts.')
  }
}
