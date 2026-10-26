import { revalidatePath } from 'next/cache'
import { after } from 'next/server'

import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import type { CommentedPost } from '@blog/db/queries/comments'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'
import { buildPostPath } from '@blog/utils/urlBuilder/buildPostPath/buildPostPath'

/**
 * After a comment is added or deleted: expires only the pages of that post (each language shows
 * the comments of both), not the whole site, and visits them so they regenerate now.
 */
export function revalidatePostPages(pages: CommentedPost[]) {
  const paths = pages.map(({ locale, number, title }) => ({
    // The default locale is served without its prefix, but cached under it.
    cached: `/${locale}${buildPostPath(number, title)}`,
    visited: `${locale === DEFAULT_LOCALE ? '' : `/${locale}`}${buildPostPath(number, title)}`,
  }))
  paths.forEach(({ cached }) => revalidatePath(cached))
  after(() => Promise.allSettled(paths.map(({ visited }) => fetch(publicUrl(visited), { cache: 'no-store' }))))
}
