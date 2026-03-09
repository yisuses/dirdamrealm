import { getLocalizedPosts } from './getLocalizedPosts'

describe('getLocalizedPosts', () => {
  const basePost = (overrides: Partial<Post> = {}): Post =>
    ({
      id: 1,
      title: 'post',
      summary: 'summary',
      publishedAt: '2022-01-01T00:00:00.000Z',
      categories: null,
      content: { blocks: [], time: 0, version: '' },
      coverImage: null,
      coverImageAuthor: null,
      coverImageSourceUrl: null,
      localizations: null,
      locale: 'en',
      writer: null,
      ...overrides,
    }) as Post

  it('should return the post matching requested locale when available in localization chain', () => {
    const localized = basePost({ id: 2, locale: 'es', title: 'Post in Spanish' })
    const root = basePost({ id: 1, locale: 'en', title: 'Post in English', localizations: [localized] })
    localized.localizations = [root]

    const [result] = getLocalizedPosts([root], 'es')

    expect(result).toEqual(localized)
  })

  it('should fallback to the root post when requested locale does not exist', () => {
    const root = basePost({ id: 1, locale: 'en', title: 'Only English' })

    const [result] = getLocalizedPosts([root], 'es')

    expect(result).toEqual(root)
  })

  it('should use localization payload when localized post is not in original posts list', () => {
    const localizedFromPayload = basePost({ id: 2, locale: 'es', title: 'Payload Spanish' })
    const root = basePost({
      id: 1,
      locale: 'en',
      title: 'Root English',
      localizations: [localizedFromPayload],
    })

    const [result] = getLocalizedPosts([root], 'es')

    expect(result).toEqual(localizedFromPayload)
  })

  it('should deduplicate duplicate root entries and keep one result per connected group', () => {
    const group1English = basePost({ id: 1, locale: 'en', title: 'Group 1 EN' })
    const group1Spanish = basePost({ id: 2, locale: 'es', title: 'Group 1 ES', localizations: [group1English] })
    group1English.localizations = [group1Spanish]

    const group2English = basePost({ id: 3, locale: 'en', title: 'Group 2 EN' })
    const duplicatedGroup1English = basePost({ id: 1, locale: 'en', title: 'Group 1 EN (duplicate)' })

    const result = getLocalizedPosts([group1English, group1Spanish, group2English, duplicatedGroup1English], 'es')

    expect(result).toEqual([group1Spanish, group2English])
  })

  it('should handle cyclic localization references without infinite loop', () => {
    const cycleNode = basePost({ id: 1, locale: 'en', title: 'Cycle EN' })
    const cyclicLocalized = basePost({ id: 2, locale: 'es', title: 'Cycle ES' })
    cycleNode.localizations = [cyclicLocalized]
    cyclicLocalized.localizations = [cycleNode]

    const [result] = getLocalizedPosts([cycleNode, cyclicLocalized], 'es')

    expect(result).toEqual(cyclicLocalized)
  })
})
