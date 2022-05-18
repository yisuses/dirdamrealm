import { SimpleGrid } from '@chakra-ui/layout'
import { format, parseISO } from 'date-fns'

import { PostCard } from '@components/common'

interface LatestPostsProps {
  posts: Post[]
}

export function LatestPosts({ posts }: LatestPostsProps) {
  return (
    <SimpleGrid
      gridTemplateColumns={{
        base: 'repeat(auto-fill, minmax(100%, 1fr))',
        md: 'repeat(auto-fill, minmax(280px, 1fr))',
      }}
      spacing={8}
      mt={8}
    >
      {posts.map(({ id, categories, publishedAt, coverImage, title, summary, imgUrl }) => (
        <PostCard
          key={id}
          id={id}
          categories={
            categories
              ? categories.map(category => ({
                  key: category.code,
                  label: category.localizedName,
                }))
              : []
          }
          date={format(parseISO(publishedAt), 'dd.MM.yyyy')}
          imageUrl={coverImage?.formats.small.url || imgUrl || 'https://picsum.photos/1440/600'}
          title={title}
          description={summary}
        />
      ))}
    </SimpleGrid>
  )
}
