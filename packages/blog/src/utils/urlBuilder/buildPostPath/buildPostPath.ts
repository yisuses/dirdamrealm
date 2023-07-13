import { seoName } from '@blog/utils'

export function buildPostPath(postId: string | number, postName: string) {
  const seoFriendlyName = seoName(postName)

  return `/post/${postId}/${seoFriendlyName}/`
}
