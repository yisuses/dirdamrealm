import { useMediaQuery } from '@chakra-ui/react'
import { Header } from '@whe/common'
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [isLargerThan1024] = useMediaQuery('(min-width: 1024px)')

  return (
    <div className={styles.container}>
      <Head>
        <title>White Emotion</title>
        <meta name="description" content="Jose Madrid Blog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header
        categories={['Deportes', 'Cultura', 'Economía', 'Tecnología']}
        logoSMpath="/images/WE-logo-MOBILE.png"
        logoLGpath="/images/WE-logo-DESKTOP.png"
        size={isLargerThan1024 ? 'lg' : 'sm'}
      />

      <main className={styles.main}>CONTENT</main>

      <footer className={styles.footer}>FOOTER</footer>
    </div>
  )
}

export default Home
