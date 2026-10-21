import * as sentry from '@sentry/nextjs'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import GlobalError from './global-error'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

describe('GlobalError', () => {
  it('should report the error and render its own document', () => {
    const error = new Error('Root layout failed')

    // It renders <html>, so mount it on the document rather than inside a <div>.
    render(<GlobalError error={error} />, { container: document })

    expect(sentry.captureException).toHaveBeenCalledWith(error)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Something went wrong')
    expect(document.documentElement).toHaveAttribute('lang', 'es')
    expect(document.body).toMatchSnapshot()
  })
})
