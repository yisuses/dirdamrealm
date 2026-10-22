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
    // suppressHydrationWarning: next-themes sets the color-mode class on <html> client-side.
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  )
}
