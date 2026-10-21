import type { Query } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getQueryClient } from './get-query-client'

const runtime = vi.hoisted(() => ({ isServer: true }))

vi.mock('@tanstack/react-query', async importOriginal => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    get isServer() {
      return runtime.isServer
    },
  }
})

const queryWithStatus = (status: string) => ({ state: { status } }) as unknown as Query

describe('getQueryClient', () => {
  afterEach(() => {
    runtime.isServer = true
  })

  it('should create a fresh client per call on the server', () => {
    expect(getQueryClient()).not.toBe(getQueryClient())
  })

  it('should reuse a single client in the browser', () => {
    runtime.isServer = false

    expect(getQueryClient()).toBe(getQueryClient())
  })

  it('should keep data fresh for a day', () => {
    expect(getQueryClient().getDefaultOptions().queries?.staleTime).toBe(24 * 3600 * 1000)
  })

  it('should dehydrate successful and pending queries only', () => {
    const shouldDehydrateQuery = getQueryClient().getDefaultOptions().dehydrate!.shouldDehydrateQuery!

    expect(shouldDehydrateQuery(queryWithStatus('success'))).toBe(true)
    expect(shouldDehydrateQuery(queryWithStatus('pending'))).toBe(true)
    expect(shouldDehydrateQuery(queryWithStatus('error'))).toBe(false)
  })
})
