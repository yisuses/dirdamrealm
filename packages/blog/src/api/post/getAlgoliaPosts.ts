import getConfig from 'next/config'
import { getAlgoliaClient } from '@api/algoliaClient'

const { publicRuntimeConfig } = getConfig()

export type GetAlgoliaPostProps = {
  query: string
}

export function getAlgoliaPosts({ query }: GetAlgoliaPostProps) {
  const index = getAlgoliaClient().initIndex(`${publicRuntimeConfig.ALGOLIA_INDEX_PREFIX}_post`)
  return index.search<AlgoliaPost>(query)
}
