import type { NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { HeaderImage } from '@/components'
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
      <MainLayout>
        <HeaderImage src="https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=868&q=80" />
      </MainLayout>
    </>
  )
}

export default Home

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'home'])),
  },
})
