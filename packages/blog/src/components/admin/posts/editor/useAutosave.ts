'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'saved' | 'pending' | 'saving' | 'error'

/**
 * Saves the latest value a moment after the last change, one save at a time. `flush` saves at
 * once (before publishing or previewing) and says whether everything is saved. Leaving the page
 * with unsaved changes asks first.
 */
export function useAutosave<T>(save: (value: T) => Promise<string>, initialSavedAt: string, delay = 1500) {
  const [status, setStatus] = useState<AutosaveStatus>('saved')
  const [savedAt, setSavedAt] = useState(initialSavedAt)
  const pending = useRef<{ value: T } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const running = useRef<Promise<boolean> | null>(null)
  const saveRef = useRef(save)
  saveRef.current = save

  const flush = useCallback(async (): Promise<boolean> => {
    clearTimeout(timer.current)
    while (running.current) {
      await running.current
    }
    const next = pending.current
    if (!next) {
      return true
    }
    pending.current = null
    setStatus('saving')
    running.current = saveRef
      .current(next.value)
      .then(at => {
        setSavedAt(at)
        if (!pending.current) {
          setStatus('saved')
        }
        return true
      })
      .catch(() => {
        // Keep it for the next try, unless something newer is already waiting.
        pending.current ??= next
        setStatus('error')
        return false
      })
      .finally(() => {
        running.current = null
      })
    return running.current
  }, [])

  const schedule = useCallback(
    (value: T) => {
      pending.current = { value }
      setStatus('pending')
      clearTimeout(timer.current)
      timer.current = setTimeout(() => void flush(), delay)
    },
    [delay, flush],
  )

  useEffect(() => {
    if (status === 'saved') {
      return
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [status])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { status, savedAt, schedule, flush }
}
