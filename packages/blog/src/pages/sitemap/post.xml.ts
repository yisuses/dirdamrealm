import { GetServerSideProps } from 'next'

import { getAllPosts } from '@blog/api/post'
import { mapLocales, xmlUrlSet } from '@blog/utils/constants'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'
import { buildPostPath } from '@blog/utils/urlBuilder'

function generateSiteMap(posts: Post[], defaultLocale: string | undefined) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    ${xmlUrlSet(
      posts
        .map(
          ({ id, title, updatedAt, locale, localizations }) => `
            <url>
            <loc>${publicUrl(`${defaultLocale === locale ? '' : '/' + locale}${buildPostPath(id, title)}`)}</loc>
            <lastmod>${updatedAt}</lastmod>
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
    )}
 `
}

function PostSiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res, defaultLocale }) => {
  // We make an API call to gather the URLs for our site
  const englishPosts = await getAllPosts({ locale: 'en' })
  const spanishPosts = await getAllPosts({ locale: 'es' })

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(([] as Post[]).concat(spanishPosts || [], englishPosts || []), defaultLocale)

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default PostSiteMap
