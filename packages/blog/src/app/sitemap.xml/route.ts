import { getCategories } from '@blog/api'
import { getAllPosts } from '@blog/api/post'
import { xmlEncoding } from '@blog/utils/constants'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'

export const dynamic = 'force-static'
export const revalidate = 3600

function generateSiteMap(lastPostUpdate: string, lastCategoryUpdate: string) {
  return `${xmlEncoding}
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>${publicUrl('/sitemap/page.xml')}</loc>
      <lastmod>${lastPostUpdate}</lastmod>
    </sitemap>
    <sitemap>
      <loc>${publicUrl('/sitemap/post.xml')}</loc>
      <lastmod>${lastPostUpdate}</lastmod>
    </sitemap>
    <sitemap>
      <loc>${publicUrl('/sitemap/category.xml')}</loc>
      <lastmod>${lastCategoryUpdate}</lastmod>
    </sitemap>
   </sitemapindex>
 `
}

export async function GET() {
  const posts = await getAllPosts({})
  const categories = await getCategories({ sort: ['updatedAt:desc'] })
  const sitemap = generateSiteMap(categories[0].updatedAt, posts ? posts[0].updatedAt || '' : '')

  const headers = new Headers()
  headers.set('Content-Type', 'text/xml')
  return new Response(sitemap, { headers })
}
