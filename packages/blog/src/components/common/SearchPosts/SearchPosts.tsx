import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { useState } from 'react'
import { useQuery } from 'react-query'

import { getAlgoliaPosts } from '@api/post/getAlgoliaPosts'
import { useDebounce } from '@hooks/useDebounce'
import { SearchPostResultItem } from './SearchPostResultItem'

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
    <div>
      <FormControl>
        <FormLabel>{inputTitle}</FormLabel>
        <Input
          size="sm"
          placeholder={inputPlaceholder}
          onChange={event => setSearchValue(event.target.value)}
          value={searchValue}
        />
      </FormControl>
      <div>
        {postResults?.map((post, index) => (
          <SearchPostResultItem key={index} post={post} />
        ))}
      </div>
    </div>
  )
}
