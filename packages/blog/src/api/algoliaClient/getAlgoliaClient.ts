import algoliasearch from 'algoliasearch'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export function getAlgoliaClient() {
  return algoliasearch(publicRuntimeConfig.ALGOLIA_APPLICATION_ID, publicRuntimeConfig.ALGOLIA_SEARCH_API_KEY)
}
