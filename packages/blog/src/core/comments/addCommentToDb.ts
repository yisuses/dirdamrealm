import { after } from 'next/server'

import { revalidatePostPages } from '@blog/core/cache/revalidatePostPages'
import { newCommentEmail } from '@blog/core/email/newCommentEmail'
import { sendEmail } from '@blog/core/email/send'
import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import { listActiveUserEmails } from '@blog/db/queries/admin/users'
import { createCommentInDb, getPostAuthorEmail } from '@blog/db/queries/comments'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'
import { buildPostPath } from '@blog/utils/urlBuilder/buildPostPath/buildPostPath'

/**
 * The post's author (the panel user linked to its signature). Without one, everyone with panel
 * access, so no comment goes unnoticed.
 */
async function recipients(postNumber: number) {
  const author = await getPostAuthorEmail(postNumber)
  return author ? [author] : listActiveUserEmails()
}

/**
 * Saves a visitor's comment, refreshes the post's pages and, once the visitor has their answer,
 * emails the notice. False when the post is not published.
 */
export async function addCommentToDb({ postId, author, text }: { postId: number; author: string; text: string }) {
  const created = await createCommentInDb({ postNumber: postId, author, text })
  if (!created) {
    return false
  }
  revalidatePostPages(created.pages)

  const { id, post } = created
  const prefix = post.locale === DEFAULT_LOCALE ? '' : `/${post.locale}`
  const email = newCommentEmail({
    author,
    text,
    postTitle: post.title,
    commentUrl: publicUrl(`${prefix}${buildPostPath(post.number, post.title)}#comment-${id}`),
    panelUrl: publicUrl('/admin/comentarios/'),
  })
  after(async () => {
    await Promise.all((await recipients(postId)).map(to => sendEmail({ to, ...email })))
  })
  return true
}
