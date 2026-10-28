/** How a language of a post is doing, in words for the panel. */
export interface TranslationState {
  status: 'draft' | 'published' | 'archived'
  scheduledFor: string | null
  hasUnpublishedChanges: boolean
}

export function formatDay(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function stateLabel({ status, scheduledFor, hasUnpublishedChanges }: TranslationState) {
  if (status === 'published') {
    return hasUnpublishedChanges
      ? { label: 'Publicada, con cambios sin publicar', palette: 'orange' }
      : { label: 'Publicada', palette: 'green' }
  }
  return scheduledFor
    ? { label: `Programada para el ${formatDay(scheduledFor)}`, palette: 'blue' }
    : { label: 'Borrador', palette: 'gray' }
}

export const localeNames = { es: 'Español', en: 'Inglés' } as const

/** The post on the site, through its number: the site redirects to the full address. */
export function publicPostPath(locale: 'es' | 'en', number: number) {
  return `${locale === 'en' ? '/en' : ''}/post/${number}/`
}

export function previewPath(locale: 'es' | 'en', number: number, token: string) {
  return `${locale === 'en' ? '/en' : ''}/vista-previa/${number}/${token}/`
}
