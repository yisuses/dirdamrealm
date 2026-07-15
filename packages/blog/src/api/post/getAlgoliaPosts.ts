import { getAlgoliaClient } from '@blog/api/algoliaClient'
import { algoliaPostMapper } from '@blog/api/mapper/postMapper/postMapper'

export type GetAlgoliaPostProps = {
  query: string
}

const indexName = `${process.env.ALGOLIA_INDEX_PREFIX}_post`

export async function getAlgoliaPosts({ query }: GetAlgoliaPostProps) {
  // algoliasearch v5 dropped initIndex(); query the index via searchSingleIndex.
  const { hits } = await getAlgoliaClient().searchSingleIndex<AlgoliaPostEntity>({
    indexName,
    searchParams: { query },
  })
  return hits.map(algoliaPostMapper)
}
