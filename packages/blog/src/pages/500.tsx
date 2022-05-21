import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { ErrorPage } from '@components'

function Custom500Page() {
  return <ErrorPage statusCode={500} />
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'errorPage'])),
  },
})

export default Custom500Page
