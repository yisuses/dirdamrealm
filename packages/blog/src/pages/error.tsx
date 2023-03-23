import { getServerTranslations } from '@core/i18n'
import Custom500Page from './500'

function CustomErrorPage() {
  return <Custom500Page />
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await getServerTranslations(locale, ['common', 'errorPage'])),
  },
})

export default CustomErrorPage
