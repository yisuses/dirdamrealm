import { GetServerSideProps } from 'next'

import { publicUrl } from '@blog/utils/generateUrl/generateUrl'

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
      <loc>https://www.whemotion.com/</loc>
     </url>
     <url>
      <loc>${publicUrl('/sitemap/page.xml')}</loc>
     </url>
     <url>
      <loc>${publicUrl('/sitemap/home.xml')}</loc>
     </url>
     <url>
     <loc>${publicUrl('/sitemap/category.xml')}</loc>
     </url>
   </urlset>
 `
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap()

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
