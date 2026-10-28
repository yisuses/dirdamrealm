import axios from 'axios'

/**
 * Browser-side reads. They go through the site's own `/api/public/*` endpoints, which read
 * Strapi or Neon on the server (see `@blog/data`), so client components never reach the
 * backend directly and work the same whichever source is active.
 */
const get = <T>(path: string, params: Record<string, string | number | undefined>) =>
  axios.get<T>(`/api/public/${path}/`, { params }).then(({ data }) => data)

export const getCategories = ({ locale, code }: { locale?: AppLocales; code?: string }) =>
  get<Category[]>('categories', { locale, code })

export const getLatestPosts = ({
  locale,
  category,
  limit,
}: {
  locale?: AppLocales
  category?: string
  limit?: number
}) => get<Post[]>('posts/latest', { locale, category, limit })

export const getAllPosts = ({ locale, category }: { locale?: AppLocales; category?: string }) =>
  get<Post[]>('posts', { locale, category })

export const getComments = ({ ids = [] }: { ids?: number[] }) => get<Commentary[]>('comments', { ids: ids.join(',') })

export const searchPosts = ({ query }: { query: string }) => get<Post[]>('search', { q: query })
