import getConfig from 'next/config'
import { getAlgoliaClient } from '@api/algoliaClient'
import { algoliaPostMapper } from '@api/mapper/postMapper'

const { publicRuntimeConfig } = getConfig()

export type GetAlgoliaPostProps = {
  query: string
}

const indexName = `${publicRuntimeConfig.ALGOLIA_INDEX_PREFIX}_post`
const index = getAlgoliaClient().initIndex(indexName)

export async function getAlgoliaPosts({ query }: GetAlgoliaPostProps) {
  return index.search<AlgoliaPostEntity>(query).then(({ hits }) => hits.map(algoliaPostMapper))
}
