import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Error as ErrorComponent } from '@components'

function Custom404Page() {
  return <ErrorComponent statusCode={404} />
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'errorPage'])),
  },
})

export default Custom404Page
