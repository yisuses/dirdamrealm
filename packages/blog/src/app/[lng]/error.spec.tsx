import * as sentry from '@sentry/nextjs'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import ErrorBoundary from './error'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

describe('Locale error boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should report the error and render the 500 page', () => {
    const error = new Error('Boom')

    const { container } = renderWithProviders(<ErrorBoundary error={error} reset={vi.fn()} />)

    expect(sentry.captureException).toHaveBeenCalledWith(error)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should report the error only once per error', () => {
    const error = new Error('Boom')

    const { rerender } = renderWithProviders(<ErrorBoundary error={error} reset={vi.fn()} />)
    rerender(<ErrorBoundary error={error} reset={vi.fn()} />)

    expect(sentry.captureException).toHaveBeenCalledTimes(1)
  })
})
