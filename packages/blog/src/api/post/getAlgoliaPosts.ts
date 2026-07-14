import { getAlgoliaClient } from '@blog/api/algoliaClient'
import { algoliaPostMapper } from '@blog/api/mapper/postMapper/postMapper'

export type GetAlgoliaPostProps = {
  query: string
}

const indexName = `${process.env.ALGOLIA_INDEX_PREFIX}_post`
const index = getAlgoliaClient().initIndex(indexName)

export async function getAlgoliaPosts({ query }: GetAlgoliaPostProps) {
  return index.search<AlgoliaPostEntity>(query).then(({ hits }) => hits.map(algoliaPostMapper))
}
