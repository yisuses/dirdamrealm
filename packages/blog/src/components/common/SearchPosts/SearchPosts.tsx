import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box } from '@chakra-ui/layout'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { getAlgoliaPosts } from '@blog/api/post'
import { useDebounce } from '@blog/hooks/useDebounce'
import { getAlgoliaPostKey } from '@blog/utils/constants'

import { SearchPostResultItem } from './SearchPostItem'

type SearchPostsProps = {
  inputTitle: string
  inputPlaceholder: string
}

export function SearchPosts({ inputTitle, inputPlaceholder }: SearchPostsProps) {
  const [searchValue, setSearchValue] = useState<string>('')
  const debouncedValue = useDebounce<string>(searchValue, 300)
  const searchResultsRef = useRef<HTMLDivElement>(null)

  const { data: postResults } = useQuery({
    queryKey: getAlgoliaPostKey(debouncedValue),
    queryFn: () => getAlgoliaPosts({ query: debouncedValue }).then(posts => posts.filter(post => post.publishedAt)),
    enabled: debouncedValue.length > 0,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
  })

  const searchResultOffset = searchResultsRef.current?.offsetTop
  return (
    <Box overflow="hidden" p="8">
      <FormControl>
        <FormLabel fontWeight="600">{inputTitle}</FormLabel>
        <Input
          variant="outline"
          size="md"
          placeholder={inputPlaceholder}
          onChange={event => setSearchValue(event.target.value)}
          value={searchValue}
          px="8px"
          _placeholder={{
            fontStyle: 'italic',
          }}
        />
      </FormControl>
      <Box
        mt="12px"
        ref={searchResultsRef}
        width="100%"
        height={{ base: `calc(100vh - ${searchResultOffset}px - 12px - 90px)`, md: '400px' }}
        display="flex"
        flexDir="column"
        flexShrink={0}
      >
        <Box pr="17px" boxSizing="content-box" width="100%" height="auto" overflowY="auto">
          {postResults?.map((post, index) => <SearchPostResultItem key={index} post={post} />)}
        </Box>
      </Box>
    </Box>
  )
}
