import { GetServerSideProps } from 'next'

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
    http://www.w3.org/1999/xhtml http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd"
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd"   
  >
     <url>
      <loc>https://www.whemotion.com</loc>
      <xhtml:link rel="alternate" hreflang="en-US" href="https://www.whemotion.com/en/"/>
      <xhtml:link rel="alternate" hreflang="es-ES" href="https://www.whemotion.com/"/>
     </url>
   </urlset>
 `
}

function PageSiteMap() {
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

export default PageSiteMap
