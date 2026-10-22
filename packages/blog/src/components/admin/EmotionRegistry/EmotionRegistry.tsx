'use client'

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useServerInsertedHTML } from 'next/navigation'
import { type ReactNode, useState } from 'react'

/**
 * Collects the styles Emotion (Chakra's engine) generates while the server renders and puts them
 * in the document head. Without it Emotion writes a <style> tag inside the body, which the client
 * render does not expect, and React reports a hydration mismatch.
 */
export function EmotionRegistry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'css' })
    // Makes Emotion's <Global> go through `insert` on the server instead of rendering a <style>.
    cache.compat = true
    const insert = cache.insert
    let inserted: string[] = []
    cache.insert = (...args) => {
      // Emotion only inserts a style it has not registered yet, so every name here is new.
      inserted.push(args[1].name)
      return insert(...args)
    }
    const flush = () => {
      const names = inserted
      inserted = []
      return names
    }
    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) {
      return null
    }
    const styles = names.map(name => cache.inserted[name]).join('')
    return <style data-emotion={`${cache.key} ${names.join(' ')}`} dangerouslySetInnerHTML={{ __html: styles }} />
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}
