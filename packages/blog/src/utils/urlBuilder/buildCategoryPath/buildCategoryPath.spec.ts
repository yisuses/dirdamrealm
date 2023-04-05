import { buildCategoryPath } from './buildCategoryPath'

describe('buildCategoryPath', () => {
  it('should return the category path correctly', () => {
    const categoryCode = '123'
    const categoryName = 'Test Category'
    const expectedPath = '/category/123/test-category/'

    const result = buildCategoryPath(categoryCode, categoryName)

    expect(result).toEqual(expectedPath)
  })
})
