import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { useEffect, useState } from 'react'

import { getAlgoliaPosts } from '@api/post/getAlgoliaPosts'
import { useDebounce } from '@hooks/useDebounce'
import { SearchPostResultItem } from './SearchPostResultItem'

export function SearchPosts() {
  const [searchValue, setSearchValue] = useState<string>('')
  const debouncedValue = useDebounce<string>(searchValue, 500)
  const [searchResults, setSearchResults] = useState<AlgoliaPost[]>([])

  useEffect(() => {
    if (debouncedValue.length) {
      getAlgoliaPosts({ query: debouncedValue })
        .then(({ hits }) => {
          setSearchResults(hits)
        })
        .catch(err => {
          console.log(err)
        })
    }
  }, [debouncedValue])

  return (
    <div>
      <FormControl>
        <FormLabel>Search</FormLabel>
        <Input
          size="sm"
          placeholder="Search post"
          onChange={event => setSearchValue(event.target.value)}
          value={searchValue}
        />
      </FormControl>
      {debouncedValue && (
        <div>
          {searchResults.map((post, index) => {
            return <SearchPostResultItem key={index} post={post} />
          })}
        </div>
      )}
    </div>
  )
}
