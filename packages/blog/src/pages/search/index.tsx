import type { GetServerSideProps, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { withErrorComponent, SearchPage as SearchPageComponent } from '@components'

const PostPage: NextPage = () => {
  return <SearchPageComponent />
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ['common', 'searchPage']))),
    },
  }
}

export default withErrorComponent(PostPage)
