import { seoName } from '@utils'

export function buildPostPath(postId: string, postName: string) {
  const seoFriendlyName = seoName(postName)

  return `/post/${postId}/${seoFriendlyName}/`
}
