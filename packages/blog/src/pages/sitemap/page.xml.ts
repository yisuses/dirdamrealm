import { GetServerSideProps } from 'next'

import { getAllPosts } from '@blog/api/post'
import { xmlUrlSet } from '@blog/utils/constants'

function generateSiteMap(lastPostUpdate: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  ${xmlUrlSet(`
    <url>
      <loc>https://www.whemotion.com</loc>
      <lastmod>${lastPostUpdate}</lastmod>
      <xhtml:link rel="alternate" hreflang="en-US" href="https://www.whemotion.com/en/"/>
      <xhtml:link rel="alternate" hreflang="es-ES" href="https://www.whemotion.com/"/>
    </url>
  `)}
  `
}

function PageSiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We generate the XML sitemap with the posts data
  const posts = await getAllPosts({})

  const sitemap = generateSiteMap(posts ? posts[0].updatedAt || '' : '')

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default PageSiteMap
