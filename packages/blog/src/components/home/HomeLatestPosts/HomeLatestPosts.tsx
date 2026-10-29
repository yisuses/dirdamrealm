'use client'

import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getLatestPosts } from '@blog/api/public'
import { PostGrid } from '@blog/components/common'
import { useLocale } from '@blog/hooks'
import { getLatestPostsKey } from '@blog/utils/constants'

interface HomeLatestPostsProps {
  title: string
  categories?: Category[]
  posts: Post[]
}

export function HomeLatestPosts({ title, categories, posts }: HomeLatestPostsProps) {
  const { t } = useTranslation('common')
  const locale = useLocale()
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [renderedPosts, setRenderedPosts] = useState(posts.slice(1))
  const headerPost = posts[0]

  const { data: queriedPosts } = useQuery({
    queryKey: getLatestPostsKey(selectedCategory),
    queryFn: () =>
      getLatestPosts({
        category: selectedCategory,
        locale: locale as AppLocales,
        limit: 16,
      }),
    enabled: selectedCategory !== undefined,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  })

  useEffect(() => {
    setRenderedPosts(queriedPosts ? queriedPosts.filter(post => post.id !== headerPost.id) : renderedPosts)
  }, [queriedPosts])

  const renderedCategories = categories
    ? [{ id: -1, code: '', name: t(`categories.all`) }].concat(
        categories.map(({ id, code, localizedName }) => ({ id, code, name: localizedName })),
      )
    : []

  return (
    <Box as="section" maxW="1248px" mx="auto" px={{ base: 4, md: 6 }} mt={{ base: 10, md: 14 }}>
      <Flex
        alignItems={{ base: 'flex-start', md: 'baseline' }}
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 4, md: 2 }}
        mb={6}
      >
        <Heading as="h2" fontSize={{ base: '26px', md: '30px' }} fontWeight={500} mr="auto" whiteSpace="nowrap">
          {title}
        </Heading>
        {Boolean(renderedCategories.length) && (
          <Flex
            gap={2}
            overflowX="auto"
            maxW="100%"
            mx={{ base: -4, md: 0 }}
            px={{ base: 4, md: 0 }}
            css={{ scrollbarWidth: 'none' }}
          >
            {renderedCategories.map(({ id, code, name }) => {
              const selected = (!selectedCategory && id === -1) || selectedCategory === code
              return (
                <Button
                  key={id}
                  size="sm"
                  rounded="full"
                  variant={selected ? 'solid' : 'outline'}
                  bg={selected ? 'fg' : 'transparent'}
                  color={selected ? 'bg' : 'fg.muted'}
                  borderColor={selected ? 'fg' : 'border'}
                  fontWeight={500}
                  fontSize="14px"
                  px={3.5}
                  flex="none"
                  aria-pressed={selected}
                  _hover={selected ? undefined : { color: 'fg', borderColor: 'fg.muted', bg: 'transparent' }}
                  onClick={() => setSelectedCategory(code)}
                >
                  {name}
                </Button>
              )
            })}
          </Flex>
        )}
      </Flex>
      <PostGrid posts={renderedPosts} limit={9} />
    </Box>
  )
}
