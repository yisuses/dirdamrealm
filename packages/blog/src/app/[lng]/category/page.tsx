import { redirect } from 'next/navigation'

import { DEFAULT_LOCALE } from '@blog/core/i18n/config'

interface Props {
  params: Promise<{ lng: AppLocales }>
}

// /category → home.
export default async function Page({ params }: Props) {
  const { lng } = await params
  redirect(lng === DEFAULT_LOCALE ? '/' : `/${lng}`)
}
