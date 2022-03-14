import type { NextPage } from 'next'
import Head from 'next/head'
import { MainLayout } from 'layout/MainLayout'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>White Emotion</title>
        <meta name="description" content="Jose Madrid Blog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>CONTENT</MainLayout>
    </>
  )
}

export default Home
