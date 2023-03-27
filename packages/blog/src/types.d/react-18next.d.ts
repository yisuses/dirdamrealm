/**
 * Types augmentation for translation keys to allow to typecheck
 * and suggesting keys to the t function. In case it's too slow
 * you can opt out by commenting the following code.
 * @link https://react.i18next.com/latest/typescript
 */
import 'i18next'
import categoryPage from '../../public/locales/en/categoryPage.json'
import common from '../../public/locales/en/common.json'
import errorPage from '../../public/locales/en/errorPage.json'
import homePage from '../../public/locales/en/homePage.json'
import postPage from '../../public/locales/en/postPage.json'

interface I18nNamespaces {
  common: typeof common
  categoryPage: typeof categoryPage
  homePage: typeof homePage
  errorPage: typeof errorPage
  postPage: typeof postPage
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: keyof I18nNamespaces
    resources: I18nNamespaces
  }
}
