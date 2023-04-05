import { buildPostPath } from './buildPostPath'

describe('buildPostPath', () => {
  it('should return the post path correctly', () => {
    const postId = '123'
    const postName = 'Test Post'
    const expectedPath = '/post/123/test-post/'

    const result = buildPostPath(postId, postName)

    expect(result).toEqual(expectedPath)
  })
})
