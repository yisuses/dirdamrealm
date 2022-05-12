import { Flex, Heading, SimpleGrid } from '@chakra-ui/layout'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { PostCard } from '../../common/PostCard/PostCard'

interface LastPostsProps {
  posts: Post[]
}

export function LastPosts({ posts }: LastPostsProps) {
  const { t } = useTranslation('homePage')
  return (
    <Flex flexDir="column" mt={{ base: '60px', md: '130px' }} mb="60px" px="20px">
      <Heading>{t('lastPosts.title')}</Heading>
      <SimpleGrid minChildWidth="300px" spacing={8} mt={8}>
        {posts.map(post => (
          <PostCard
            key={post.id}
            categories={post.categories.map(category => ({ key: category.code, label: category.name }))}
            date={format(parseISO(post.publishedAt), 'dd.MM.yyyy')}
            imageUrl={post.coverImage?.url || post.imgUrl || 'https://picsum.photos/1440/600'}
            title={post.title}
            description={post.summary}
          />
        ))}
      </SimpleGrid>
    </Flex>
  )
}
