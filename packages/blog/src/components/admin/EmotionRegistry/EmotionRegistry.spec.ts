import styled from '@emotion/styled'
import { useServerInsertedHTML } from 'next/navigation'
import { type ReactElement, createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { EmotionRegistry } from './EmotionRegistry'

// A server render, in the node project: that is where Emotion keeps the generated css as text.

const First = styled.p({ color: 'rgb(1, 2, 3)' })
const Second = styled.p({ color: 'rgb(4, 5, 6)' })

const inserted = vi.hoisted(() => ({ callback: undefined as undefined | (() => ReactElement | null) }))

vi.mock('next/navigation', async importOriginal => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useServerInsertedHTML: vi.fn((callback: () => ReactElement | null) => {
    inserted.callback = callback
  }),
}))

const renderInRegistry = (...children: ReactElement[]) =>
  renderToString(createElement(EmotionRegistry, null, ...children))

describe('EmotionRegistry', () => {
  it('should hand the styles generated while rendering to the document head, once each', () => {
    renderInRegistry(createElement(First, null, 'Hola'))

    expect(useServerInsertedHTML).toHaveBeenCalled()
    const style = inserted.callback!()
    expect(style?.type).toBe('style')
    expect((style?.props as Record<string, string>)['data-emotion']).toMatch(/^css /)
    expect(
      (style?.props as { dangerouslySetInnerHTML: Record<string, string> }).dangerouslySetInnerHTML['__html'],
    ).toContain('color:rgb(1, 2, 3)')

    // Already flushed: nothing new to insert on the next pass.
    expect(inserted.callback!()).toBeNull()
  })

  it('should not register the same style twice', () => {
    renderInRegistry(createElement(Second, { key: 1 }, 'Uno'), createElement(Second, { key: 2 }, 'Dos'))

    const style = inserted.callback!()
    expect((style?.props as Record<string, string>)['data-emotion'].split(' ')).toHaveLength(2)
  })
})
