import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ErrorPage } from '@components'

function Custom404Page() {
  return <ErrorPage statusCode={404} />
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'errorPage'])),
  },
})

export default Custom404Page
