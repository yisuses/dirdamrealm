import type { CustomTypeOptions } from 'i18next'
import type { SSRConfig, UserConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import nextI18nextConfig from '../../../next-i18next.config'

export type I18nNamespace = keyof CustomTypeOptions['resources']

export type I18nActiveNamespaces = I18nNamespace[]

export const getServerTranslations = async (
  locale: string,
  namespacesRequired?: I18nActiveNamespaces | I18nNamespace | undefined,
  configOverride?: UserConfig | null,
  extraLocales?: string[] | false,
): Promise<SSRConfig> => {
  const config = configOverride ?? nextI18nextConfig

  // Slice needed here cause serverSlideTranslations does not accept Readonly type
  return serverSideTranslations(locale, namespacesRequired, config, extraLocales)
}
