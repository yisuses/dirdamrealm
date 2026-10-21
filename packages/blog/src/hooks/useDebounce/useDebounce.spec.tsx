import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the initial value straight away', () => {
    const { result } = renderHook(() => useDebounce('a', 100))

    expect(result.current).toBe('a')
  })

  it('should update the value once the given delay has passed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), { initialProps: { value: 'a' } })

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(99))
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('b')
  })

  it('should default to a 500ms delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), { initialProps: { value: 1 } })

    rerender({ value: 2 })
    act(() => vi.advanceTimersByTime(499))
    expect(result.current).toBe(1)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(2)
  })

  it('should drop intermediate values when the value changes again before the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), { initialProps: { value: 'a' } })

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(50))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(50))
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(50))
    expect(result.current).toBe('c')
  })
})
