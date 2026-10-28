import { revalidatePath } from 'next/cache'
import { after } from 'next/server'

import { DEFAULT_LOCALE, LOCALES } from '@blog/core/i18n/config'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'

const sitemaps = ['/sitemap.xml', '/sitemap/post.xml', '/sitemap/page.xml', '/sitemap/category.xml']

const prefix = (lng: AppLocales) => (lng === DEFAULT_LOCALE ? '' : `/${lng}`)

/**
 * After an edit in the panel: expires every public page (the header and footer data — categories,
 * contact, social links — is loaded by the `[lng]` layout) and the sitemaps, then visits the
 * pages an editor checks first so they regenerate now rather than on the next reader's visit.
 */
export function revalidatePublicContent({ warm = [] }: { warm?: string[] } = {}) {
  revalidatePath('/[lng]', 'layout')
  sitemaps.forEach(path => revalidatePath(path))

  const paths = [...LOCALES.flatMap(lng => [`${prefix(lng)}/`, `${prefix(lng)}/archive/`]), ...warm]
  after(() => Promise.allSettled(paths.map(path => fetch(publicUrl(path), { cache: 'no-store' }))))
}
