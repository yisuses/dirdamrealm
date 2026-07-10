import algoliasearch from 'algoliasearch'

export function getAlgoliaClient() {
  return algoliasearch(process.env.ALGOLIA_APPLICATION_ID as string, process.env.ALGOLIA_SEARCH_API_KEY as string)
}
