import { NextPageContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { Error as ErrorComponent } from '../components'

export function Error({ statusCode }: ErrorProps) {
  return <ErrorComponent statusCode={statusCode} />
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'errorPage'])),
  },
})

export default Error

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err && err.statusCode
  return { statusCode: statusCode ?? 404 }
}

interface ErrorProps {
  statusCode: number
}
