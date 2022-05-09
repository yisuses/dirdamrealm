import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Error as ErrorComponent } from '../components'

export function Error() {
  return <ErrorComponent />
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'errorPage'])),
  },
})

export default Error
