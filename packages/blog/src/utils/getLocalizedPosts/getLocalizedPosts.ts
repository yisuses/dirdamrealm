export const getLocalizedPosts = (posts: Post[], locale: AppLocales): Post[] => {
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
