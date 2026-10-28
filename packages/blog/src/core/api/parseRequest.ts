import type { Session } from 'next-auth'
import type { ZodType } from 'zod'

import { auth } from '@blog/core/auth/config'

type Failure = { ok: false; response: Response }

/**
 * Every admin route handler starts here: the proxy also guards `/api/admin`, but each handler
 * checks the session itself so no route depends on the proxy matcher being right.
 */
export async function requireAuth(): Promise<{ ok: true; session: Session } | Failure> {
  const session = await auth()
  if (!session?.user) {
    return { ok: false, response: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { ok: true, session }
}

/** Session check plus a zod-validated JSON body, in one call. */
export async function parseAuthRequest<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ ok: true; session: Session; data: T } | Failure> {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return { ok: false, response: Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return { ok: false, response: Response.json({ error: parsed.error.issues }, { status: 400 }) }
  }
  return { ok: true, session: authResult.session, data: parsed.data }
}
