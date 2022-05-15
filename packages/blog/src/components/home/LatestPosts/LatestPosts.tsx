import { useColorModeValue } from '@chakra-ui/color-mode'
import { Flex, Heading, HStack, SimpleGrid, Text } from '@chakra-ui/layout'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { getLatestPosts } from 'api'

import { PostCard } from '../../common/PostCard/PostCard'

interface LatestPostsProps {
  categories: Category[]
  posts: Post[]
}

export function LatestPosts({ categories, posts }: LatestPostsProps) {
  const { t } = useTranslation(['common', 'homePage'])
  const { locale } = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [renderedPosts, setRenderedPosts] = useState(posts.slice(1))
  const { data: queriedPosts } = useQuery(
    ['latestPosts', { selectedCategory }],
    async () => getLatestPosts({ lang: locale as AppLocales, category: selectedCategory }),
    { enabled: selectedCategory !== undefined, refetchOnWindowFocus: false },
  )

  useEffect(() => {
    setRenderedPosts(queriedPosts ? queriedPosts.filter(post => post.id !== posts[0]?.id) : renderedPosts)
  }, [queriedPosts])

  const renderedCategories = [{ id: -1, code: '', name: t(`common:categories.all`) }].concat(
    categories.map(category => ({
      id: category.id,
      code: category.code,
      name: (locale && category.locale?.[locale as AppLocales]) || category.name,
    })),
  )

  return (
    <Flex flexDir="column" mt={{ base: '60px', md: '130px' }} mb="60px" px="20px">
      <Heading>{t('homePage:lastPosts.title')}</Heading>
      <HStack spacing="20px" mt="20px" overflow="auto">
        {renderedCategories.map(category => (
          <Text
            py={1}
            key={category.id}
            fontFamily="Lora"
            fontSize="xs"
            fontWeight={700}
            color={selectedCategory === category.code ? 'orange.300' : useColorModeValue('gray.750', 'gray.50')}
            _hover={{ cursor: 'pointer', color: 'orange.300' }}
            transition="color 0.2s ease-in-out"
            whiteSpace="nowrap"
            onClick={() => setSelectedCategory(category.code)}
          >
            {category.name}
          </Text>
        ))}
      </HStack>
      <SimpleGrid
        gridTemplateColumns={{
          base: 'repeat(auto-fill, minmax(100%, 1fr))',
          md: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
        spacing={8}
        mt={8}
      >
        {renderedPosts.map(post => (
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
