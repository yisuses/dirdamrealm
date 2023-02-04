import * as Sentry from '@sentry/nextjs'
import axios from 'axios'
import getConfig from 'next/config'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { addComment } from '@api/comment'

const { serverRuntimeConfig } = getConfig()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { body, method } = req

  const { postId, author, text, captcha } = body

  if (method === 'POST') {
    if (!postId || !author || !text || !captcha) {
      Sentry.captureException('AddCommentValidate - Unproccesable request, please provide the required fields')
      return res.status(422).json({
        message: 'Unproccesable request, please provide the required fields',
      })
    }

    try {
      const captchaValidation = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${serverRuntimeConfig.RECAPTCHA_SECRET_KEY}&response=${captcha}`,
        {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          },
        },
      )
      if (captchaValidation.data.success) {
        await addComment({ postId, author, text })
        return res.status(200).send('OK')
      }

      Sentry.captureException('Invalid captcha code')
      return res.status(422).json({
        message: 'Unproccesable request, Invalid captcha code',
      })
    } catch (error) {
      Sentry.captureException(error)
      return res.status(422).json({ message: 'Something went wrong' })
    }
  }

  return res.status(404).send('Not found')
}
