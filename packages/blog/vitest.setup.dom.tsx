import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from 'react'
import { afterEach, vi } from 'vitest'

import { navigation, resetNavigation } from '@blog/test/navigation'

// Vitest runs without globals, so Testing Library cannot register its own cleanup.
afterEach(() => {
  cleanup()
  resetNavigation()
})

// jsdom lacks the layout APIs Chakra and next-themes reach for.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
})
class ObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
window.ResizeObserver = ObserverStub as unknown as typeof ResizeObserver
window.IntersectionObserver = ObserverStub as unknown as typeof IntersectionObserver
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
Element.prototype.scrollIntoView = vi.fn()

// The App Router hooks need a mounted router. Tests drive them through `navigation`
// (see src/test/navigation.ts); `notFound` and `redirect` keep their real behaviour.
vi.mock('next/navigation', async importOriginal => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useParams: () => navigation.params,
  usePathname: () => navigation.pathname,
  useSearchParams: () => navigation.searchParams,
  useRouter: () => navigation.router,
}))

// next/link and next/image need the Next runtime; plain elements keep the props visible.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, style, 'aria-hidden': ariaHidden }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={src as string} alt={alt} width={width} height={height} style={style} aria-hidden={ariaHidden} />
  ),
}))
