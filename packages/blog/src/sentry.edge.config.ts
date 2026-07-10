// Sentry edge runtime (middleware / edge routes) initialization. Loaded from instrumentation.ts.
import * as sentry from '@sentry/nextjs'

sentry.init({
  dsn: process.env.NEXTJS_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
