import { seoName } from '@utils'

export function buildPostPath(postId: string | number, postName: string) {
  const seoFriendlyName = seoName(postName)

  return `/post/${postId}/${seoFriendlyName}/`
}
