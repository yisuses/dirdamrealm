import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAutosave } from './useAutosave'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((ok, fail) => {
    resolve = ok
    reject = fail
  })
  return { promise, resolve, reject }
}

const unloadPrevented = () => {
  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)
  return event.defaultPrevented
}

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should save the latest value once, a moment after the last change', async () => {
    const save = vi.fn(async (value: string) => `saved ${value}`)
    const { result } = renderHook(() => useAutosave(save, 'start'))
    expect(result.current).toMatchObject({ status: 'saved', savedAt: 'start' })
    expect(unloadPrevented()).toBe(false)

    act(() => result.current.schedule('a'))
    act(() => result.current.schedule('ab'))
    expect(result.current.status).toBe('pending')
    expect(unloadPrevented()).toBe(true)
    await act(() => vi.advanceTimersByTimeAsync(1499))
    expect(save).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(save).toHaveBeenCalledExactlyOnceWith('ab')
    expect(result.current).toMatchObject({ status: 'saved', savedAt: 'saved ab' })
    expect(unloadPrevented()).toBe(false)
  })

  it('should save at once on flush, and report there is nothing left to save', async () => {
    const save = vi.fn(async () => 'now')
    const { result } = renderHook(() => useAutosave(save, 'start', 10_000))

    await act(async () => expect(await result.current.flush()).toBe(true))
    expect(save).not.toHaveBeenCalled()

    act(() => result.current.schedule('x'))
    await act(async () => expect(await result.current.flush()).toBe(true))
    expect(save).toHaveBeenCalledExactlyOnceWith('x')
    expect(result.current.status).toBe('saved')
  })

  it('should keep a failed value for the next try', async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('later')
    const { result } = renderHook(() => useAutosave(save, 'start'))

    act(() => result.current.schedule('x'))
    await act(async () => expect(await result.current.flush()).toBe(false))
    expect(result.current.status).toBe('error')
    expect(unloadPrevented()).toBe(true)

    await act(async () => expect(await result.current.flush()).toBe(true))
    expect(save).toHaveBeenLastCalledWith('x')
    expect(result.current).toMatchObject({ status: 'saved', savedAt: 'later' })
  })

  it('should wait for a running save, and keep newer values that arrive meanwhile', async () => {
    const first = deferred<string>()
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce('second')
    const { result } = renderHook(() => useAutosave(save, 'start'))

    act(() => result.current.schedule('one'))
    let running!: Promise<boolean>
    act(() => {
      running = result.current.flush()
    })
    expect(result.current.status).toBe('saving')
    act(() => result.current.schedule('two'))
    let next!: Promise<boolean>
    act(() => {
      next = result.current.flush()
    })

    await act(async () => {
      first.resolve('first')
      await running
    })
    await act(async () => expect(await next).toBe(true))
    expect(save).toHaveBeenLastCalledWith('two')
    expect(result.current).toMatchObject({ status: 'saved', savedAt: 'second' })
  })

  it('should not overwrite a newer value with one that failed', async () => {
    const first = deferred<string>()
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce('ok')
    const { result } = renderHook(() => useAutosave(save, 'start'))

    act(() => result.current.schedule('old'))
    let running!: Promise<boolean>
    act(() => {
      running = result.current.flush()
    })
    act(() => result.current.schedule('new'))
    await act(async () => {
      first.reject(new Error('offline'))
      await running
    })

    await act(async () => {
      await result.current.flush()
    })
    expect(save).toHaveBeenLastCalledWith('new')
  })

  it('should stop its timer when unmounted', async () => {
    const save = vi.fn(async () => 'x')
    const { result, unmount } = renderHook(() => useAutosave(save, 'start'))

    act(() => result.current.schedule('x'))
    unmount()
    await vi.advanceTimersByTimeAsync(5000)

    expect(save).not.toHaveBeenCalled()
  })
})
