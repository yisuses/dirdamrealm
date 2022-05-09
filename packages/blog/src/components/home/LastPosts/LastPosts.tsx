import { Flex, Heading, SimpleGrid } from '@chakra-ui/layout'
import { useTranslation } from 'next-i18next'
import { PostCard } from '../../common/PostCard/PostCard'

interface LastPostsProps {
  posts: Post[]
}

export function LastPosts({ posts }: LastPostsProps) {
  const { t } = useTranslation('homePage')
  return (
    <Flex flexDir="column" mt={130}>
      <Heading>{t('lastPosts.title')}</Heading>
      <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} spacing={8} mt={8}>
        {posts.map(post => (
          <PostCard
            key={post.id}
            categories={post.categories.map(category => ({ key: category.code, label: category.name }))}
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
