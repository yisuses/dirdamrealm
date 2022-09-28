import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { useEffect, useState } from 'react'

import { getAlgoliaPosts } from '@api/post/getAlgoliaPosts'
import { useDebounce } from '@hooks/useDebounce'
import { SearchPostResultItem } from './SearchPostResultItem'

type SearchPostsProps = {
  inputTitle: string
  inputPlaceholder: string
}

export function SearchPosts({ inputTitle, inputPlaceholder }: SearchPostsProps) {
  const [searchValue, setSearchValue] = useState<string>('')
  const debouncedValue = useDebounce<string>(searchValue, 500)
  const [postResults, setPostResults] = useState<AlgoliaPost[]>([])

  useEffect(() => {
    if (debouncedValue.length) {
      getAlgoliaPosts({ query: debouncedValue })
        .then(({ hits }) => {
          setPostResults(hits)
        })
        .catch(err => {
          console.log(err)
        })
    }
  }, [debouncedValue])

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
      {debouncedValue && (
        <div>
          {postResults.map((post, index) => (
            <SearchPostResultItem key={index} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
