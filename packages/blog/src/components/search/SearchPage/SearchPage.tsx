import { useTranslation } from 'next-i18next'
import { WebPage } from 'schema-dts'

import { Metadata } from '@components'
import { publicUrl } from '@utils/generateUrl'

export function SearchPage() {
  const { t } = useTranslation('searchPage')

  const ldJson: WebPage = {
    '@type': 'WebPage',
    headline: t('searchPage.title'),
    url: publicUrl('/search'),
  }

  return (
    <>
      <Metadata name={t('searchPage.title')} description={t('searchPage.description')} ldJson={[ldJson]} />
      <div>Busqueda</div>
    </>
  )
}
