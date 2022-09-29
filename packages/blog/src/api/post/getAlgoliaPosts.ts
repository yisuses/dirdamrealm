import getConfig from 'next/config'
import { getAlgoliaClient } from '@api/algoliaClient'

const { publicRuntimeConfig } = getConfig()

export type GetAlgoliaPostProps = {
  query: string
}

export function getAlgoliaPosts({ query }: GetAlgoliaPostProps) {
  const indexName = `${publicRuntimeConfig.ALGOLIA_INDEX_PREFIX}_post`

  const index = getAlgoliaClient().initIndex(indexName)
  return index.search<AlgoliaPost>(query)
}
