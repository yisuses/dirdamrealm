import { GetServerSideProps } from 'next'

import { getCategories } from '@blog/api/category'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'
import { buildCategoryPath } from '@blog/utils/urlBuilder'

type CategoryWithLocale = Category & { queryLocale: string }

const mapLocales: Record<AppLocales, string> = {
  en: 'en-US',
  es: 'es-ES',
}

function generateSiteMap(categories: CategoryWithLocale[], defaultLocale: string | undefined) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
      http://www.w3.org/1999/xhtml http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd"
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xhtml="http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd"   
    >
     ${categories
       .map(
         ({ code, updatedAt, queryLocale, localizedName, locale }) =>
           `
       <url>
        <loc>${publicUrl(
          `${defaultLocale === queryLocale ? '' : '/' + queryLocale}${buildCategoryPath(code, localizedName)}`,
        )}</loc>
        <lastmod>${updatedAt}</lastmod>
        ${
          locale && Object.keys(locale).length > 0
            ? (Object.keys(locale) as AppLocales[])
                .filter(key => key !== queryLocale)
                .map(
                  localeKey =>
                    `<xhtml:link rel="alternate" hreflang="${mapLocales[localeKey]}" href="${publicUrl(
                      `${defaultLocale === localeKey ? '' : '/' + localeKey}${buildCategoryPath(
                        code,
                        locale[localeKey],
                      )}`,
                    )}"/>`,
                )
                .join('')
            : ''
        }
       </url>
    `,
       )
       .join('')}
   </urlset>
 `
}

function CategorySiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res, defaultLocale }) => {
  // We make an API call to gather the URLs for our site
  const spanishCategories = await getCategories({ locale: 'es' })
  const englishCategories = await getCategories({ locale: 'en' })

  // We generate the XML sitemap with the posts data
  const categories: CategoryWithLocale[] = []
  const spanishCategoriesMod: CategoryWithLocale[] = spanishCategories.map(sc => ({
    ...sc,
    queryLocale: 'es',
  }))
  const englishCategoriesMod: CategoryWithLocale[] = englishCategories.map(ec => ({
    ...ec,
    queryLocale: 'en',
  }))
  const sitemap = generateSiteMap(categories.concat(spanishCategoriesMod, englishCategoriesMod), defaultLocale)

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default CategorySiteMap
