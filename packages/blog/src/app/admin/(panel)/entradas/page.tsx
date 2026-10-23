import { PostList } from '@blog/components/admin/posts/PostList'
import { isUuid } from '@blog/core/validation/uuid'
import { type PostListFilters, listEditorOptions, listPostsForAdmin } from '@blog/db/queries/admin/posts'

type SearchParams = Record<string, string | string[] | undefined>

const statuses = ['published', 'draft', 'scheduled'] as const

/** The list's filters from the address, ignoring anything that is not a valid value. */
function toFilters(params: SearchParams): PostListFilters {
  const value = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '')
  const status = statuses.find(option => option === value('estado'))
  const locale = value('idioma') === 'es' || value('idioma') === 'en' ? (value('idioma') as 'es' | 'en') : undefined
  return {
    query: value('q').trim().slice(0, 100) || undefined,
    locale,
    status,
    categoryId: isUuid(value('categoria')) ? value('categoria') : undefined,
    page: Math.min(Math.max(Number.parseInt(value('pagina'), 10) || 1, 1), 1000),
  }
}

export default async function PostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = toFilters(await searchParams)
  const [{ posts, total }, { categories }] = await Promise.all([listPostsForAdmin(filters), listEditorOptions()])
  return <PostList posts={posts} total={total} filters={filters} categories={categories} />
}
