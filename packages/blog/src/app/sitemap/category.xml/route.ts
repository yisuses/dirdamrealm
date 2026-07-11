import { getCategories } from '@blog/api/category'
import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import { mapLocales, xmlUrlSet } from '@blog/utils/constants'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'
import { buildCategoryPath } from '@blog/utils/urlBuilder'

export const dynamic = 'force-static'
export const revalidate = 3600

type CategoryWithLocale = Category & { queryLocale: string }

function generateSiteMap(categories: CategoryWithLocale[], defaultLocale: string) {
  return xmlUrlSet(
    categories
      .map(
        ({ code, updatedAt, queryLocale, localizedName, translations }) => `
          <url>
          <loc>${publicUrl(
            `${defaultLocale === queryLocale ? '' : '/' + queryLocale}${buildCategoryPath(code, localizedName)}`,
          )}</loc>
          <lastmod>${updatedAt}</lastmod>
          ${
            translations && Object.keys(translations).length > 0
              ? (Object.keys(translations) as AppLocales[])
                  .filter(key => key !== queryLocale)
                  .map(
                    localeKey =>
                      `<xhtml:link rel="alternate" hreflang="${mapLocales[localeKey]}" href="${publicUrl(
                        `${defaultLocale === localeKey ? '' : '/' + localeKey}${buildCategoryPath(
                          code,
                          translations[localeKey],
                        )}`,
                      )}"/>`,
                  )
                  .join('')
              : ''
          }
          </url>
        `,
      )
      .join(''),
  )
}

export async function GET() {
  const spanishCategories = await getCategories({ locale: 'es' })
  const englishCategories = await getCategories({ locale: 'en' })

  const categories: CategoryWithLocale[] = []
  const spanishCategoriesMod: CategoryWithLocale[] = spanishCategories.map(sc => ({ ...sc, queryLocale: 'es' }))
  const englishCategoriesMod: CategoryWithLocale[] = englishCategories.map(ec => ({ ...ec, queryLocale: 'en' }))
  const sitemap = generateSiteMap(categories.concat(spanishCategoriesMod, englishCategoriesMod), DEFAULT_LOCALE)

  const headers = new Headers()
  headers.set('Content-Type', 'text/xml')
  return new Response(sitemap, { headers })
}
