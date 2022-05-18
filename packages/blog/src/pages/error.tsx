import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Custom500Page from './500'

function CustomErrorPage() {
  return <Custom500Page />
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'errorPage'])),
  },
})

export default CustomErrorPage
