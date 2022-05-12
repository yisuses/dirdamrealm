const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
  },
  // By default set suspense to false to prevent timeouts on vercel
  // when using getServerSideTranslations
  react: {
    useSuspense: false,
  },
  localePath: path.resolve('./public/locales'),
}
