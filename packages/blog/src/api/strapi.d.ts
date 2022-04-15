interface StrapiResponse<T> {
  data: {
    id: number
    attributes: T
  }[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}
