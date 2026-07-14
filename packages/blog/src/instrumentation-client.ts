// Sentry browser initialization (Sentry 8+ replaces sentry.client.config).
// Runs whenever a page is visited. https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as sentry from '@sentry/nextjs'

sentry.init({
  dsn: process.env.NEXTJS_SENTRY_DSN,
  beforeSend: (event, hint) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event', event)

      console.log('Sentry hint', hint)
    }
    return event
  },
  ignoreErrors: [
    // @link https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded/50387233#50387233
    'ResizeObserver loop limit exceeded',
  ],
})

// Instruments client-side navigations for tracing (Sentry 10 + Next App/Pages Router).
export const onRouterTransitionStart = sentry.captureRouterTransitionStart
