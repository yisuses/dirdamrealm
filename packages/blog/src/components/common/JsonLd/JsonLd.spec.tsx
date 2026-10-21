import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { JsonLd } from './JsonLd'

describe('JsonLd', () => {
  it('should render one ld+json script per item with the schema.org context', () => {
    const { container } = render(
      <JsonLd
        items={[
          { '@type': 'WebPage', name: 'Home' },
          { '@type': 'BlogPosting', headline: 'Post' },
        ]}
      />,
    )

    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts).toHaveLength(2)
    expect(JSON.parse(scripts[0].innerHTML)).toEqual({
      '@context': 'https://schema.org/',
      '@type': 'WebPage',
      name: 'Home',
    })
    expect(JSON.parse(scripts[1].innerHTML)).toEqual({
      '@context': 'https://schema.org/',
      '@type': 'BlogPosting',
      headline: 'Post',
    })
    expect(container).toMatchSnapshot()
  })

  it('should render nothing without items', () => {
    const { container } = render(<JsonLd items={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
