import { NextPage } from 'next'

const Error: NextPage<ErrorProps> = () => {
  return <div />
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err && err.statusCode ? err.statusCode : 404

  if (res && statusCode >= 500 && statusCode < 600) {
    res.writeHead(302, {
      Location: '/error',
    })
    res.end()
  }

  return { statusCode: statusCode ?? 404 }
}

interface ErrorProps {
  statusCode: number
}

export default Error
