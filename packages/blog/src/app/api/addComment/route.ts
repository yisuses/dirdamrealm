import * as sentry from '@sentry/nextjs'
import axios from 'axios'

import { addComment } from '@blog/api/comment'

export async function POST(request: Request) {
  const { postId, author, text, captcha } = await request.json().catch(() => ({}))

  if (!postId || !author || !text || !captcha) {
    sentry.captureException('AddCommentValidate - Unproccesable request, please provide the required fields')
    return Response.json({ message: 'Unproccesable request, please provide the required fields' }, { status: 422 })
  }

  try {
    const captchaValidation = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`,
      {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      },
    )

    if (captchaValidation.data.success) {
      await addComment({ postId, author, text })
      return new Response('OK', { status: 200 })
    }

    sentry.captureException('Invalid captcha code')
    return Response.json({ message: 'Unproccesable request, Invalid captcha code' }, { status: 422 })
  } catch (error) {
    sentry.captureException(error)
    return Response.json({ message: 'Something went wrong' }, { status: 422 })
  }
}
