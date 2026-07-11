'use client'

import * as sentry from '@sentry/nextjs'
import { useEffect } from 'react'

import { ErrorPage } from '@blog/components/error/ErrorPage'

export default function Error({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    sentry.captureException(error)
  }, [error])

  return <ErrorPage statusCode={500} />
}
