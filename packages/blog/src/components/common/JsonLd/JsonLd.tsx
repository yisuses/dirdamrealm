import { BlogPosting, ItemList, WebPage } from 'schema-dts'

type JsonLdItem = WebPage | BlogPosting | ItemList

interface JsonLdProps {
  items: JsonLdItem[]
}

/**
 * Renders JSON-LD structured data. Plain (hookless) component so it can be used from
 * Server Components, replacing the ld+json output of the old `<Metadata>` component.
 */
export function JsonLd({ items }: JsonLdProps) {
  return (
    <>
      {items.map((item, index) => (
        <script
          key={`ldJson-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ '@context': 'https://schema.org/', ...item }),
          }}
        />
      ))}
    </>
  )
}
