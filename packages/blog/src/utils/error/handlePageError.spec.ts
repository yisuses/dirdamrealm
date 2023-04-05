import { handlePageError, ApiError, NotFoundError } from './handlePageError'

describe('handlePageError', () => {
  const response = {
    statusCode: 200,
  } as any

  it('should return notFound when error is instance of NotFoundError', () => {
    const error = new NotFoundError('Resource not found')
    const result = handlePageError(error, response)
    expect(result).toEqual({ notFound: true })
  })

  it('should return error props when error is instance of ApiError', () => {
    const error = new ApiError('Error in API')
    const result = handlePageError(error, response)
    expect(response.statusCode).toBe(502)
    expect(result).toEqual({ props: { error: true, statusCode: 502 } })
  })

  it('should return error props with status code 500 when error is not instance of NotFoundError or ApiError', () => {
    const error = new Error('Unknown error')
    const result = handlePageError(error, response)
    expect(response.statusCode).toBe(500)
    expect(result).toEqual({ props: { error: true, statusCode: 500 } })
  })
})
