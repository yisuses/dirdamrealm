/**
 * Types augmentation for translation keys to allow to typecheck
 * and suggesting keys to the t function. In case it's too slow
 * you can opt out by commenting the following code.
 * @link https://react.i18next.com/latest/typescript
 */
import 'react-i18next'
import type categoryPage from '../../public/locales/en/categoryPage.json'
import type common from '../../public/locales/en/common.json'
import type errorPage from '../../public/locales/en/errorPage.json'
import type homePage from '../../public/locales/en/homePage.json'
import type postPage from '../../public/locales/en/postPage.json'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      categoryPage: typeof categoryPage
      homePage: typeof homePage
      errorPage: typeof errorPage
      postPage: typeof postPage
    }
  }
}
