type SearchPostResultItemProps = {
  post: AlgoliaPost
}

export function SearchPostResultItem({ post }: SearchPostResultItemProps) {
  return <p>{post.title}</p>
}
