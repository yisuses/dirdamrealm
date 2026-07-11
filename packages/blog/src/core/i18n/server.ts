import type { i18n as I18nInstance } from 'i18next'
import { getResources, getT, initServerI18next } from 'next-i18next/server'

import { i18nConfig } from './config'
import type { I18nNamespace } from './i18n-namespaces.type'

const serverConfig = {
  ...i18nConfig,
  // Serverless-safe: bundle the locale JSON via dynamic import instead of reading
  // from public/ on the filesystem (which is not available at runtime on Vercel).
  resourceLoader: (language: string, namespace: string) =>
    import(`../../../public/locales/${language}/${namespace}.json`),
}

// initServerI18next only sets a module-level config, so it is safe (and cheap) to call on
// every use. Doing so — rather than guarding with a flag — guarantees the co-located getT
// sees the config even when Turbopack splits this module across per-route chunks.
function ensureInit() {
  initServerI18next(serverConfig)
}

// Run once at module load too, so any import of this module initializes its own copy.
ensureInit()

/**
 * Translation function for Server Components / generateMetadata. The locale is passed
 * explicitly (from the `[lng]` route param) so no request-scoped `headers()` are read,
 * which keeps pages statically renderable (SSG).
 */
export async function getServerT<Ns extends I18nNamespace = I18nNamespace>(lng: string, ns?: Ns | Ns[]) {
  ensureInit()
  return getT(ns, { lng })
}

export function getServerResources(i18n: I18nInstance, namespaces?: readonly string[]) {
  return getResources(i18n, namespaces as string[] | undefined)
}
