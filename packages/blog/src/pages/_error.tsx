import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'

export function Error() {
  return (
    <>
      <h1>Error</h1>
      <p>
        <Link href="/">
          <a>Go to home</a>
        </Link>
      </p>
    </>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default Error
