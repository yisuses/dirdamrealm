import { getAllPosts } from '@blog/api/post'
import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import { getImageUrlFromMedia } from '@blog/utils'
import { mapLocales, xmlUrlSet } from '@blog/utils/constants'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'
import { buildPostPath } from '@blog/utils/urlBuilder'

export const dynamic = 'force-static'
export const revalidate = 3600

function generateSiteMap(posts: Post[], defaultLocale: string) {
  return xmlUrlSet(
    posts
      .map(
        ({ id, title, publishedAt, updatedAt, locale, localizations, coverImage }) => `
            <url>
            <loc>${publicUrl(`${defaultLocale === locale ? '' : '/' + locale}${buildPostPath(id, title)}`)}</loc>
            <lastmod>${updatedAt}</lastmod>
            <news:publication_date>${publishedAt}</news:publication_date>
            ${
              coverImage &&
              `<image:image>
              <image:loc>${getImageUrlFromMedia({ media: coverImage, format: 'small' })}</image:loc>
            </image:image>`
            }
            ${
              localizations && localizations.length > 0
                ? localizations
                    .map(
                      localization =>
                        `<xhtml:link rel="alternate" hreflang="${mapLocales[localization.locale]}" href="${publicUrl(
                          `${defaultLocale === localization.locale ? '' : '/' + localization.locale}${buildPostPath(
                            localization.id,
                            localization.title,
                          )}`,
                        )}"/>`,
                    )
                    .concat([
                      `<xhtml:link rel="alternate" hreflang="${mapLocales[locale]}" href="${publicUrl(
                        `${defaultLocale === locale ? '' : '/' + locale}${buildPostPath(id, title)}`,
                      )}"/>`,
                    ])
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
  const posts = await getAllPosts({})
  const sitemap = generateSiteMap(posts || [], DEFAULT_LOCALE)

  const headers = new Headers()
  headers.set('Content-Type', 'text/xml')
  return new Response(sitemap, { headers })
}
