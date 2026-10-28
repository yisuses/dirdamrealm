// Sentry browser initialization (Sentry 8+ replaces sentry.client.config).
// Runs whenever a page is visited. https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as sentry from '@sentry/nextjs'
import { initBotId } from 'botid/client/core'

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

// Vercel BotID: an invisible check that the panel's login and password recovery are used by a
// person, not a script. The server rejects these requests when it fails (checkBotId).
initBotId({
  protect: [
    // next-auth posts without the trailing slash; Next redirects it to the slashed url.
    { path: '/api/auth/callback/credentials', method: 'POST' },
    { path: '/api/auth/callback/credentials/', method: 'POST' },
    { path: '/api/password-reset/request/', method: 'POST' },
    { path: '/api/password-reset/confirm/', method: 'POST' },
  ],
})

// Instruments client-side navigations for tracing (Sentry 10 + Next App/Pages Router).
export const onRouterTransitionStart = sentry.captureRouterTransitionStart
