import { ErrorPage } from '@blog/components'
import { getServerTranslations } from '@blog/core/i18n'

function Custom500Page() {
  return <ErrorPage statusCode={500} />
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await getServerTranslations(locale, ['common', 'errorPage'])),
  },
})

export default Custom500Page
