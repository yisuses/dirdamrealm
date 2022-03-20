import type { NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { MainLayout } from 'layout/MainLayout'

const Home: NextPage = () => {
  const { t } = useTranslation('common')
  return (
    <>
      <Head>
        <title>{t('pageTitle')}</title>
        <meta name="description" content="Jose Madrid Blog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>CONTENT</MainLayout>
    </>
  )
}

export default Home

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'home'])),
  },
})
