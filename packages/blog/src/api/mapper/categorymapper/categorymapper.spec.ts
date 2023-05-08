import { categoryMapper, algoliaCategoryMapper } from './categoryMapper'

describe('categoryMapper', () => {
  const locale: AppLocales = 'en'

  it('should map a categoryEntity correctly', () => {
    const categoryEntity: StrapiDataItem<CategoryResponseEntity> = {
      id: 1,
      attributes: {
        code: 'category1',
        main: true,
        name: 'Category One',
        locale: { en: 'Category One', es: 'Categoría Uno' },
        description: 'This is category one',
        createdAt: '2022-01-01',
        updatedAt: '2022-01-02',
      },
    }

    const expectedCategory: Category = {
      id: 1,
      code: 'category1',
      main: true,
      name: 'Category One',
      locale: { en: 'Category One', es: 'Categoría Uno' },
      description: 'This is category one',
      createdAt: '2022-01-01',
      updatedAt: '2022-01-02',
      localizedName: 'Category One',
    }

    expect(categoryMapper(categoryEntity, locale)).toEqual(expectedCategory)
  })

  it('should map a categoryEntity with null locale attribute correctly', () => {
    const categoryEntity: StrapiDataItem<CategoryResponseEntity> = {
      id: 2,
      attributes: {
        code: 'category2',
        main: false,
        name: 'Category Two',
        locale: null as unknown as Record<AppLocales, string> | undefined,
        description: 'This is category two',
        createdAt: '2022-01-01',
        updatedAt: '2022-01-02',
      },
    }

    const expectedCategory: Category = {
      id: 2,
      code: 'category2',
      main: false,
      name: 'Category Two',
      locale: null as unknown as Record<AppLocales, string> | undefined,
      description: 'This is category two',
      createdAt: '2022-01-01',
      updatedAt: '2022-01-02',
      localizedName: 'Category Two',
    }

    expect(categoryMapper(categoryEntity, locale)).toEqual(expectedCategory)
  })

  describe('algoliaCategoryMapper', () => {
    it('should map category entity with localizedName correctly', () => {
      const categoryEntity: Category = {
        id: 1,
        code: 'test-code',
        main: false,
        name: 'Test Category',
        description: 'This is a test category',
        createdAt: '2022-01-01',
        updatedAt: '2022-01-02',
        locale: {
          en: 'Test Category',
          es: 'Categoría de prueba',
        },
        localizedName: 'Test Category',
      }
      const locale: AppLocales = 'es'
      const mappedCategory = algoliaCategoryMapper(categoryEntity, locale)

      expect(mappedCategory).toEqual({
        id: 1,
        code: 'test-code',
        main: false,
        name: 'Test Category',
        description: 'This is a test category',
        createdAt: '2022-01-01',
        updatedAt: '2022-01-02',
        locale: {
          en: 'Test Category',
          es: 'Categoría de prueba',
        },
        localizedName: 'Categoría de prueba',
      })
    })

    it('should map category entity without localizedName correctly', () => {
      const categoryEntity: Category = {
        id: 1,
        code: 'test-code',
        main: false,
        name: 'Test Category',
        description: 'This is a test category',
        createdAt: '2022-01-01',
        updatedAt: '2022-01-02',
        locale: undefined,
        localizedName: 'Test Category',
      }
      const locale: AppLocales = 'es'
      const mappedCategory = algoliaCategoryMapper(categoryEntity, locale)

      expect(mappedCategory).toEqual({
        id: 1,
        code: 'test-code',
        main: false,
        createdAt: '2022-01-01',
        updatedAt: '2022-01-02',
        name: 'Test Category',
        description: 'This is a test category',
        locale: undefined,
        localizedName: 'Test Category',
      })
    })
  })
})
