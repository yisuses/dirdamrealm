import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Upstash is provisioned on Vercel; without its variables (local development) there is no limit.
const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
    : null

/** Login attempts: 5 per minute per IP. */
export const loginRatelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '60 s'), prefix: 'ratelimit:login' })
  : null

/** Password reset requests: 3 per 15 minutes per IP, so the endpoint cannot be used to spam inboxes. */
export const passwordResetRatelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '15 m'), prefix: 'ratelimit:password-reset' })
  : null
