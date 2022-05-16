import { ServerResponse } from 'http'
import { GetServerSidePropsResult } from 'next'

import { WithErrorProps } from '@components'
import { ApiError, NotFoundError } from './index'

export const handlePageError = (error: Error, response: ServerResponse): GetServerSidePropsResult<WithErrorProps> => {
  if (error instanceof NotFoundError) {
    return { notFound: true }
  }

  if (error instanceof ApiError) {
    response.statusCode = 502
    return {
      props: { error: true, statusCode: 502 },
    }
  }

  response.statusCode = 500
  return {
    props: { error: true, statusCode: 500 },
  }
}
