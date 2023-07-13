import { seoName } from '@blog/utils'

export function buildCategoryPath(categoryCode: string, categoryName: string) {
  const seoFriendlyName = seoName(categoryName)

  return `/category/${categoryCode}/${seoFriendlyName}/`
}
