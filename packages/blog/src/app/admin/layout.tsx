import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { AdminProviders } from '@blog/components/admin/AdminProviders/AdminProviders'

export const metadata: Metadata = {
  title: 'Panel · Emoción Blanca',
  robots: { index: false, follow: false },
}

// Per-request: the panel shows live data and depends on the session, never on the ISR cache.
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  )
}
