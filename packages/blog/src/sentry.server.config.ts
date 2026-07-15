// Sentry server (Node.js runtime) initialization. Loaded from instrumentation.ts.
import * as sentry from '@sentry/nextjs'

sentry.init({
  dsn: process.env.NEXTJS_SENTRY_DSN,
  tracesSampleRate: 1.0,
  beforeSend: (event, hint) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event', event)

      console.log('Sentry hint', hint)
    }
    return event
  },
})
