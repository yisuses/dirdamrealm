import { useColorModeValue } from '@chakra-ui/color-mode'
import { Flex, Heading, HStack, Text } from '@chakra-ui/layout'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { getLatestPosts } from '@api'
import { LatestPosts } from '@components/common'

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
  const { data: queriedPosts } = useQuery(
    ['latestPosts', { selectedCategory }],
    async () => getLatestPosts({ locale: locale as AppLocales, category: selectedCategory }),
    {
      enabled: selectedCategory !== undefined,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  )

  useEffect(() => {
    setRenderedPosts(queriedPosts ? queriedPosts.filter(post => post.id !== posts[0]?.id) : renderedPosts)
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
      <LatestPosts posts={renderedPosts} />
    </Flex>
  )
}
