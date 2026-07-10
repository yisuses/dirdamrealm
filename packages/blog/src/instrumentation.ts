import * as sentry from '@sentry/nextjs'

// Loads the right Sentry config per runtime (Sentry 8+ / Next instrumentation hook).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Captures errors thrown in nested React Server Components / server data fetching.
export const onRequestError = sentry.captureRequestError
