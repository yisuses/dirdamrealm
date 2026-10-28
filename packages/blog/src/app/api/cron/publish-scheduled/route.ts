import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { publishScheduled } from '@blog/db/queries/admin/posts'

/**
 * Vercel Cron, every morning (see vercel.json): publishes what was scheduled for today. Vercel
 * sends `CRON_SECRET` as a bearer token; anything else is refused.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const published = await publishScheduled()
  if (published.length > 0) {
    revalidatePublicContent()
  }
  return Response.json({ published })
}
