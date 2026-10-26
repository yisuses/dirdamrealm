import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@blog/core/auth/config'
import { revalidatePostPages } from '@blog/core/cache/revalidatePostPages'
import { deleteComment } from '@blog/db/queries/admin/comments'

import { DELETE } from './[id]/route'

vi.mock('@blog/core/auth/config', () => ({ auth: vi.fn() }))
vi.mock('@blog/core/cache/revalidatePostPages', () => ({ revalidatePostPages: vi.fn() }))
vi.mock('@blog/db/queries/admin/comments', () => ({ deleteComment: vi.fn() }))

const pages = [{ number: 10, locale: 'es', title: 'Hola' }]
const remove = (id: string) =>
  DELETE(new Request(`https://whemotion.com/api/admin/comments/${id}/`), { params: Promise.resolve({ id }) })

describe('DELETE /api/admin/comments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'me' }, expires: '' } as never)
  })

  it('should refuse without a session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    expect((await remove('5')).status).toBe(401)
    expect(deleteComment).not.toHaveBeenCalled()
  })

  it('should delete the comment and refresh the pages that showed it', async () => {
    vi.mocked(deleteComment).mockResolvedValue(pages as never)

    expect((await remove('5')).status).toBe(204)
    expect(deleteComment).toHaveBeenCalledWith(5)
    expect(revalidatePostPages).toHaveBeenCalledWith(pages)
  })

  it('should answer 404 for malformed or missing comments', async () => {
    vi.mocked(deleteComment).mockResolvedValue(undefined)

    expect((await remove('abc')).status).toBe(404)
    expect(deleteComment).not.toHaveBeenCalled()
    expect((await remove('9')).status).toBe(404)
    expect(revalidatePostPages).not.toHaveBeenCalled()
  })
})
