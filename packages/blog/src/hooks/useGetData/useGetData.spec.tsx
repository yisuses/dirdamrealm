import { describe, expect, it } from 'vitest'

import { createTestQueryClient, renderHookWithProviders } from '@blog/test/render'

import { useGetData } from './useGetData'

describe('useGetData', () => {
  it('should return the cached data for the key', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['post', 1], { id: 1 })

    const { result } = renderHookWithProviders(() => useGetData(['post', 1], { id: 0 }), { queryClient })

    expect(result.current).toEqual({ id: 1 })
  })

  it('should return the default value when nothing is cached', () => {
    const { result } = renderHookWithProviders(() => useGetData(['post', 1], { id: 0 }))

    expect(result.current).toEqual({ id: 0 })
  })

  it('should return undefined when nothing is cached and there is no default', () => {
    const { result } = renderHookWithProviders(() => useGetData(['post', 1]))

    expect(result.current).toBeUndefined()
  })
})
