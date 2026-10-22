import { describe, expect, it, vi } from 'vitest'

import { getCategoryForAdmin, listCategoriesForAdmin } from '@blog/db/queries/admin/categories'

import EditCategoryPage from './[id]/page'
import NewCategoryPage from './nueva/page'
import CategoriesPage from './page'

vi.mock('@blog/db/queries/admin/categories', () => ({
  listCategoriesForAdmin: vi.fn(async () => ['list']),
  getCategoryForAdmin: vi.fn(),
}))

const id = '5efd132e-40a2-4f98-bc16-cc1fa8aa118e'
const params = (value: string) => ({ params: Promise.resolve({ id: value }) })
const notFound = expect.objectContaining({ digest: expect.stringContaining('NEXT_HTTP_ERROR_FALLBACK;404') })

describe('category pages', () => {
  it('should list the categories from the database', async () => {
    const page = await CategoriesPage()

    expect(page.props.categories).toEqual(['list'])
    expect(listCategoriesForAdmin).toHaveBeenCalled()
  })

  it('should render an empty form for a new category', () => {
    expect(NewCategoryPage().props.category).toBeUndefined()
  })

  it('should edit an existing category', async () => {
    vi.mocked(getCategoryForAdmin).mockResolvedValueOnce({ id } as never)

    expect((await EditCategoryPage(params(id))).props.category).toEqual({ id })
  })

  it('should 404 for unknown or malformed ids without querying the malformed ones', async () => {
    vi.mocked(getCategoryForAdmin).mockClear()

    await expect(EditCategoryPage(params(id))).rejects.toMatchObject(notFound)
    await expect(EditCategoryPage(params('nope'))).rejects.toMatchObject(notFound)
    expect(getCategoryForAdmin).toHaveBeenCalledTimes(1)
  })
})
