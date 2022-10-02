import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box } from '@chakra-ui/layout'
import { useState } from 'react'
import { useQuery } from 'react-query'

import { getAlgoliaPosts } from '@api/post/getAlgoliaPosts'
import { useDebounce } from '@hooks/useDebounce'
import { SearchPostResultItem } from './SearchPostItem'

type SearchPostsProps = {
  inputTitle: string
  inputPlaceholder: string
}

export function SearchPosts({ inputTitle, inputPlaceholder }: SearchPostsProps) {
  const [searchValue, setSearchValue] = useState<string>('')
  const debouncedValue = useDebounce<string>(searchValue, 300)

  const { data: postResults } = useQuery(
    ['algoliaPosts', { debouncedValue }],
    () => getAlgoliaPosts({ query: debouncedValue }).then(({ hits }) => hits.filter(hit => hit.publishedAt)),
    {
      enabled: debouncedValue.length > 0,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      onError: err => console.log(err),
    },
  )

  return (
    <Box overflow="hidden">
      <FormControl>
        <FormLabel>{inputTitle}</FormLabel>
        <Input
          size="sm"
          placeholder={inputPlaceholder}
          onChange={event => setSearchValue(event.target.value)}
          value={searchValue}
        />
      </FormControl>
      <Box
        width="100%"
        height={{ base: 'calc(100vh - 115px)', md: '470px' }}
        display="flex"
        flexDir="column"
        flexShrink={0}
      >
        <Box pr="17px" boxSizing="content-box" width="100%" height="auto" overflowY="auto">
          {postResults?.map((post, index) => (
            <SearchPostResultItem key={index} post={post} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
