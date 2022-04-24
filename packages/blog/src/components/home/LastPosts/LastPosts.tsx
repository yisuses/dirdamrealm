import { Flex, Heading, SimpleGrid } from '@chakra-ui/react'
import { PostCard } from '@whe/common'
import { useTranslation } from 'next-i18next'

interface LastPostsProps {
  posts: Post[]
}

export function LastPosts({ posts }: LastPostsProps) {
  const { t } = useTranslation('homePage')
  return (
    <Flex>
      <Heading>{t('lastPosts.title')}</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        {posts.map(post => (
          <PostCard
            key={post.id}
            categories={post.categories.map(category => category.code)}
            date={post.publishedAt}
            imageUrl={post.imgUrl}
            title={post.title}
            description={post.summary}
          />
        ))}
      </SimpleGrid>
    </Flex>
  )
}
