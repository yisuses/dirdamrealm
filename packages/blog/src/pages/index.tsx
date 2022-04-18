import type { NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { HomePage } from '@/components/home'

const Home: NextPage = () => {
  return <HomePage />
}

export default Home

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'homePage'])),
  },
})
