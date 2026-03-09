import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from '@blog/api/mapper'
import { apiUrl } from '@blog/utils'

const getLocalizedPosts = (posts: Post[], locale: AppLocales): Post[] => {
  const postsById = new Map(posts.map(post => [post.id, post]))
  const visited = new Set<number>()
  const localizedPosts: Post[] = []

  posts.forEach(rootPost => {
    if (visited.has(rootPost.id)) {
      return
    }

    const groupedPosts = new Map<number, Post>()
    const stack: Post[] = [rootPost]

    while (stack.length > 0) {
      const currentPost = stack.pop()

      if (!currentPost || visited.has(currentPost.id)) {
        continue
      }

      visited.add(currentPost.id)
      groupedPosts.set(currentPost.id, currentPost)
      ;(currentPost.localizations || []).forEach(localizedPost => {
        const relatedPost = postsById.get(localizedPost.id) || localizedPost
        if (!visited.has(relatedPost.id)) {
          stack.push(relatedPost)
        }
      })
    }

    const localePost = Array.from(groupedPosts.values()).find(({ locale: postLocale }) => postLocale === locale)
    localizedPosts.push(localePost || rootPost)
  })

  return localizedPosts
}

type GetAllPostParams = {
  locale?: AppLocales
}

export async function getAllPosts({ locale }: GetAllPostParams): Promise<Post[] | undefined> {
  const query = stringify({
    sort: ['updatedAt:desc'],
    publicationState: 'live',
    populate: ['localizations', 'coverImage'],
    locale: ['en', 'es'],
    pagination: {
      page: 1,
      pageSize: 100000,
    },
  })

  return axios
    .get<PostResponse>(apiUrl(`/api/posts?${query}`))
    .then(({ data: response }) => {
      const mappedPosts = response.data.map(postMapper)

      if (!locale) {
        return mappedPosts
      }

      return getLocalizedPosts(mappedPosts, locale)
    })
    .catch(err => {
      console.error(err)
      throw new Error('Error retrieving posts.')
    })
}
