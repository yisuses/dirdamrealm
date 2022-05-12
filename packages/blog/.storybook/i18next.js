import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpApi from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

const ns = ['common']
const supportedLngs = ['es', 'en']

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
    ns,
    supportedLngs,
  })

supportedLngs.forEach(lang => {
  ns.forEach(n => {
    i18n.addResourceBundle(lang, n, require(`../public/locales/${lang}/${n}.json`))
  })
})

export default i18n
