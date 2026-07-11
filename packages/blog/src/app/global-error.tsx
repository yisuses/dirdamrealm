'use client'

import * as sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// Only catches errors thrown in the root layout itself; must render its own <html>/<body>.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body>
        <h1>Something went wrong</h1>
      </body>
    </html>
  )
}
