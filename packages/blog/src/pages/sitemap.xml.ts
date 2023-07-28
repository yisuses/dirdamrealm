import { GetServerSideProps } from 'next'

import { getCategories } from '@blog/api'
import { getAllPosts } from '@blog/api/post'
import { xmlEncoding } from '@blog/utils/constants'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'

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

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We generate the XML sitemap with the posts data
  const posts = await getAllPosts({})
  const categories = await getCategories({ sort: ['updatedAt:desc'] })
  const sitemap = generateSiteMap(categories[0].updatedAt, posts ? posts[0].updatedAt || '' : '')

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
