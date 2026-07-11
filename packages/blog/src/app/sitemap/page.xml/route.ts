import { getAllPosts } from '@blog/api/post'
import { publicUrl } from '@blog/utils'
import { xmlUrlSet } from '@blog/utils/constants'

export const dynamic = 'force-static'
export const revalidate = 3600

function generateSiteMap(lastPostUpdate: string) {
  return xmlUrlSet(`
    <url>
      <loc>https://www.whemotion.com</loc>
      <lastmod>${lastPostUpdate}</lastmod>
      <image:image>
        <image:loc>${publicUrl('/images/WElogo.png')}</image:loc>
      </image:image>
      <xhtml:link rel="alternate" hreflang="en-US" href="https://www.whemotion.com/en/"/>
      <xhtml:link rel="alternate" hreflang="es-ES" href="https://www.whemotion.com/"/>
    </url>
  `)
}

export async function GET() {
  const posts = await getAllPosts({})
  const sitemap = generateSiteMap(posts ? posts[0].updatedAt || '' : '')

  const headers = new Headers()
  headers.set('Content-Type', 'text/xml')
  return new Response(sitemap, { headers })
}
