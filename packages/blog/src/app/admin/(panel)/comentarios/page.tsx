import { CommentList } from '@blog/components/admin/comments/CommentList'
import { listCommentsForAdmin } from '@blog/db/queries/admin/comments'

type SearchParams = Record<string, string | string[] | undefined>

export default async function CommentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : ''
  const page = Math.min(
    Math.max(Number.parseInt(typeof params.pagina === 'string' ? params.pagina : '', 10) || 1, 1),
    1000,
  )
  const { comments, total } = await listCommentsForAdmin({ query, page })
  return <CommentList comments={comments} total={total} query={query} page={page} />
}
