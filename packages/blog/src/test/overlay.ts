import { waitFor } from '@testing-library/react'
import { expect } from 'vitest'

/**
 * Chakra overlays (dialog, drawer, menu) finish mounting in effects: the layer stack sets
 * their `style` and the title/description ids are linked through `aria-*` a tick or more
 * after they appear. Wait for all of it before a snapshot, or the snapshot records
 * whichever half-mounted state the machine happened to be in.
 */
export async function waitForOverlay(content: HTMLElement) {
  await waitFor(() => {
    // Inline, not computed: jsdom computes `pointer-events: auto` for every element.
    expect(content.style.getPropertyValue('--layer-index')).not.toBe('')
    if (content.querySelector('[data-part="title"]')) {
      expect(content).toHaveAttribute('aria-labelledby')
    }
    if (content.querySelector('[data-part="description"]')) {
      expect(content).toHaveAttribute('aria-describedby')
    }
  })
}
