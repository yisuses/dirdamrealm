import { commentMapper } from './commentMapper'

describe('commentMapper', () => {
  it('should map comment entity to commentary correctly', () => {
    const commentEntity = {
      id: 1,
      attributes: {
        text: 'Lorem ipsum',
        author: true,
        createdAt: '2022-04-03T14:21:54.127Z',
        updatedAt: '2022-04-03T14:21:54.127Z',
      },
    }
    const expectedCommentary = {
      id: 1,
      text: 'Lorem ipsum',
      author: true,
      createdAt: '2022-04-03T14:21:54.127Z',
      updatedAt: '2022-04-03T14:21:54.127Z',
    }
    const result = commentMapper(commentEntity)
    expect(result).toEqual(expectedCommentary)
  })
})
