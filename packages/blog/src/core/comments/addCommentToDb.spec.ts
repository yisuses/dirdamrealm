import { after } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { revalidatePostPages } from '@blog/core/cache/revalidatePostPages'
import { sendEmail } from '@blog/core/email/send'
import { listActiveUserEmails } from '@blog/db/queries/admin/users'
import { createCommentInDb, getPostAuthorEmail } from '@blog/db/queries/comments'

import { addCommentToDb } from './addCommentToDb'

vi.mock('next/server', () => ({ after: vi.fn() }))
vi.mock('@blog/core/cache/revalidatePostPages', () => ({ revalidatePostPages: vi.fn() }))
vi.mock('@blog/core/email/send', async importOriginal => ({
  ...(await importOriginal<typeof import('@blog/core/email/send')>()),
  sendEmail: vi.fn(async () => true),
}))
vi.mock('@blog/db/queries/admin/users', () => ({ listActiveUserEmails: vi.fn(async () => ['tio@example.com']) }))
vi.mock('@blog/db/queries/comments', () => ({ createCommentInDb: vi.fn(), getPostAuthorEmail: vi.fn() }))

const comment = { postId: 10, author: 'Ana', text: 'Muy bueno' }
const spanish = { number: 10, locale: 'es' as const, title: 'Hola mundo' }
const english = { number: 11, locale: 'en' as const, title: 'Hello world' }
const runAfter = () => (vi.mocked(after).mock.calls[0]![0] as () => Promise<unknown>)()

describe('addCommentToDb', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://whemotion.com')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('should not save anything for a post that is not published', async () => {
    vi.mocked(createCommentInDb).mockResolvedValue(undefined)

    await expect(addCommentToDb(comment)).resolves.toBe(false)
    expect(revalidatePostPages).not.toHaveBeenCalled()
    expect(after).not.toHaveBeenCalled()
  })

  it("should save, refresh the post's pages and email every panel user when the post has no author", async () => {
    vi.mocked(createCommentInDb).mockResolvedValue({ id: 5, post: spanish, pages: [spanish, english] })

    await expect(addCommentToDb(comment)).resolves.toBe(true)

    expect(createCommentInDb).toHaveBeenCalledWith({ postNumber: 10, author: 'Ana', text: 'Muy bueno' })
    expect(revalidatePostPages).toHaveBeenCalledWith([spanish, english])
    expect(sendEmail).not.toHaveBeenCalled()
    await runAfter()
    expect(listActiveUserEmails).toHaveBeenCalled()
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'tio@example.com',
        subject: 'Emoción Blanca: nuevo comentario de Ana en «Hola mundo»',
        text: expect.stringMatching(/\/post\/10\/hola-mundo\/#comment-5\n.*\/admin\/comentarios\/$/),
      }),
    )
    expect(vi.mocked(sendEmail).mock.calls[0]![0].text).not.toContain('/es/')
  })

  it("should email only the post's author, linking English posts under /en", async () => {
    vi.mocked(getPostAuthorEmail).mockResolvedValue('autor@example.com')
    vi.mocked(createCommentInDb).mockResolvedValue({ id: 6, post: english, pages: [english] })

    await addCommentToDb({ ...comment, postId: 11 })
    await runAfter()

    expect(getPostAuthorEmail).toHaveBeenCalledWith(11)
    expect(listActiveUserEmails).not.toHaveBeenCalled()
    expect(vi.mocked(sendEmail).mock.calls.map(([email]) => email.to)).toEqual(['autor@example.com'])
    expect(vi.mocked(sendEmail).mock.calls[0]![0].text).toContain('/en/post/11/hello-world/#comment-6')
  })
})
