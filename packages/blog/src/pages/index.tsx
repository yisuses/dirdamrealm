import { Image } from '@chakra-ui/react'
import { Header } from '@whe/common'
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>White Emotion</title>
        <meta name="description" content="Jose Madrid Blog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header
        categories={['Deportes', 'Cultura', 'Economía', 'Tecnología']}
        logoSM={
          <Image maxHeight={'45px'} objectFit="cover" src="/images/WE-logo-MOBILE.png" alt="White Emotion Logo" />
        }
        logoLG={
          <Image maxHeight={'70px'} objectFit="cover" src="/images/WE-logo-DESKTOP.png" alt="White Emotion Logo" />
        }
      />

      <main className={styles.main}>CONTENT</main>

      <footer className={styles.footer}>FOOTER</footer>
    </div>
  )
}

export default Home
