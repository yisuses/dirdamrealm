import { useColorModeValue } from '@chakra-ui/color-mode'
import { Flex, HStack, Heading, Text } from '@chakra-ui/layout'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { getLatestPosts } from '@blog/api'
import { PostGrid } from '@blog/components/common'
import { getLatestPostsKey } from '@blog/utils/constants'

interface HomeLatestPostsProps {
  title: string
  categories?: Category[]
  posts: Post[]
}

export function HomeLatestPosts({ title, categories, posts }: HomeLatestPostsProps) {
  const { t } = useTranslation('common')
  const { locale } = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [renderedPosts, setRenderedPosts] = useState(posts.slice(1))
  const headerPost = posts[0]

  const { data: queriedPosts } = useQuery(
    getLatestPostsKey(selectedCategory),
    () =>
      getLatestPosts({
        category: selectedCategory,
        locale: locale as AppLocales,
        limit: 16,
      }),
    {
      enabled: selectedCategory !== undefined,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  )

  useEffect(() => {
    setRenderedPosts(queriedPosts ? queriedPosts.filter(post => post.id !== headerPost.id) : renderedPosts)
  }, [queriedPosts])

  const renderedCategories = categories
    ? [{ id: -1, code: '', name: t(`categories.all`) }].concat(
        categories.map(({ id, code, localizedName }) => ({ id, code, name: localizedName })),
      )
    : []

  return (
    <Flex flexDir="column" mt={{ base: '60px', md: '130px' }} mb="60px" px="20px">
      <Heading fontFamily="Lora">{title}</Heading>
      {Boolean(renderedCategories.length) && (
        <HStack spacing="20px" mt="20px" overflow="auto">
          {renderedCategories.map(({ id, code, name }) => (
            <Text
              tabIndex={0}
              role="button"
              py={1}
              key={id}
              fontFamily="Lora"
              fontSize="sm"
              fontWeight={700}
              color={
                (!selectedCategory && id === -1) || selectedCategory === code
                  ? 'orange.300'
                  : useColorModeValue('gray.750', 'gray.50')
              }
              _hover={{ cursor: 'pointer', color: 'orange.300' }}
              _focus={{ color: 'orange.300' }}
              _focusWithin={{ outline: 'none' }}
              transition="color 0.2s ease-in-out"
              whiteSpace="nowrap"
              onClick={() => setSelectedCategory(code)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedCategory(code)
                }
              }}
            >
              {name}
            </Text>
          ))}
        </HStack>
      )}
      <PostGrid posts={renderedPosts} />
    </Flex>
  )
}
