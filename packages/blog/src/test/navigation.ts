import { vi } from 'vitest'

/**
 * State behind the mocked `next/navigation` hooks (see vitest.setup.dom.tsx). Mutate it in
 * a test to render as if on another url or locale; it is reset after every test.
 */
export const navigation = {
  params: { lng: 'es' } as Record<string, string | string[] | undefined>,
  pathname: '/es',
  searchParams: new URLSearchParams(),
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  },
}

export function resetNavigation() {
  navigation.params = { lng: 'es' }
  navigation.pathname = '/es'
  navigation.searchParams = new URLSearchParams()
  Object.values(navigation.router).forEach(fn => fn.mockReset())
}
