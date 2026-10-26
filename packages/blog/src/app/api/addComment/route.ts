import * as sentry from '@sentry/nextjs'

import { verifyRecaptcha } from '@blog/core/captcha/recaptcha'
import { commentRatelimit } from '@blog/core/ratelimit'
import { commentSchema } from '@blog/core/validation/comment'
import { addComment } from '@blog/data'

const unprocessable = (message: string) => Response.json({ message }, { status: 422 })

/** The post page's comment form: limits per IP, checks the reCAPTCHA, then saves the comment. */
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
  if (commentRatelimit) {
    const { success } = await commentRatelimit.limit(ip ?? 'unknown')
    if (!success) {
      return Response.json({ message: 'Too many comments, try again later' }, { status: 429 })
    }
  }

  const parsed = commentSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return unprocessable('Unproccesable request, please provide the required fields')
  }
  const { postId, author, text, captcha } = parsed.data

  try {
    if (!(await verifyRecaptcha(captcha, ip))) {
      return unprocessable('Unproccesable request, Invalid captcha code')
    }
    if (!(await addComment({ postId, author, text }))) {
      return Response.json({ message: 'Post not found' }, { status: 404 })
    }
    return new Response('OK', { status: 200 })
  } catch (error) {
    sentry.captureException(error)
    return unprocessable('Something went wrong')
  }
}
