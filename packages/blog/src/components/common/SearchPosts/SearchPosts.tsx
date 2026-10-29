'use client'

import { Box, Flex, Input, Text, VisuallyHidden } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuSearch } from 'react-icons/lu'

import { searchPosts } from '@blog/api/public'
import { useDebounce } from '@blog/hooks/useDebounce'
import { getAlgoliaPostKey } from '@blog/utils/constants'

import { SearchPostResultItem } from './SearchPostItem'

type SearchPostsProps = {
  inputTitle: string
  inputPlaceholder: string
}

export function SearchPosts({ inputTitle, inputPlaceholder }: SearchPostsProps) {
  const { t } = useTranslation('common')
  const [searchValue, setSearchValue] = useState<string>('')
  const debouncedValue = useDebounce<string>(searchValue, 300)

  const { data: postResults } = useQuery({
    queryKey: getAlgoliaPostKey(debouncedValue),
    queryFn: () => searchPosts({ query: debouncedValue }).then(posts => posts.filter(post => post.publishedAt)),
    enabled: debouncedValue.length > 0,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
  })

  return (
    <Box>
      <Flex
        as="label"
        alignItems="center"
        gap={3}
        px={3}
        pt={2}
        pb={3.5}
        pr={12}
        borderBottom="1px solid"
        borderColor="border"
      >
        <Box color="accent" flex="none" fontSize="22px">
          <LuSearch />
        </Box>
        <VisuallyHidden>{inputTitle}</VisuallyHidden>
        <Input
          variant="flushed"
          border={0}
          fontFamily="heading"
          fontSize={{ base: '20px', md: '24px' }}
          px={0}
          autoFocus
          placeholder={inputPlaceholder}
          onChange={event => setSearchValue(event.target.value)}
          value={searchValue}
          _placeholder={{ color: 'fg.muted', fontStyle: 'italic' }}
          _focusVisible={{ boxShadow: 'none' }}
        />
      </Flex>
      {postResults && (
        <Text
          fontFamily="sans"
          fontSize="12px"
          textTransform="uppercase"
          letterSpacing="0.08em"
          color="fg.muted"
          px={3}
          pt={3.5}
          pb={1.5}
        >
          {t('header.search.results', { count: postResults.length })}
        </Text>
      )}
      <Box maxH={{ base: 'calc(100vh - 140px)', md: '60vh' }} overflowY="auto">
        {postResults?.map(post => (
          <SearchPostResultItem key={post.id} post={post} />
        ))}
      </Box>
    </Box>
  )
}
