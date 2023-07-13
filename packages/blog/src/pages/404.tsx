import { ErrorPage } from '@blog/components'
import { getServerTranslations } from '@blog/core/i18n'

function Custom404Page() {
  return <ErrorPage statusCode={404} />
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  const inlinedTranslation = await getServerTranslations(locale, ['common', 'errorPage'])
  return {
    props: {
      ...inlinedTranslation,
    },
  }
}

export default Custom404Page
