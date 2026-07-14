import axios from 'axios'

import { getAllPosts, postResponseEnMock } from '@blog/api/post'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const requestedUrl = () => decodeURIComponent(mockedAxios.get.mock.calls[0]![0] as string)

describe('getAllPosts', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: { data: [postResponseEnMock] } })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('maps the posts returned by the API', async () => {
    // getAllPosts fetches each locale separately (Strapi v5 populates `localizations`
    // only for single-locale queries); mock one locale with the post, the other empty.
    mockedAxios.get
      .mockResolvedValueOnce({ data: { data: [postResponseEnMock] } })
      .mockResolvedValueOnce({ data: { data: [] } })

    const posts = await getAllPosts({})

    expect(posts).toHaveLength(1)
    expect(posts?.[0]).toMatchObject({
      id: postResponseEnMock.id,
      title: postResponseEnMock.title,
    })
  })

  it('does not add a category filter when none is provided', async () => {
    await getAllPosts({})

    expect(requestedUrl()).not.toContain('filters')
  })

  it('filters by category code when a category is provided', async () => {
    await getAllPosts({ category: 'ENG' })

    expect(requestedUrl()).toContain('filters[categories][code]=ENG')
  })
})
