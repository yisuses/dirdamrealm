import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@blog/core/auth/config'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { applyPostAction, createPost, createTranslation, deletePost, savePost } from '@blog/db/queries/admin/posts'

import { POST as ADD_LANGUAGE, PATCH, PUT } from './[postId]/[locale]/route'
import { DELETE } from './[postId]/route'
import { POST } from './route'

vi.mock('@blog/core/auth/config', () => ({ auth: vi.fn() }))
vi.mock('@blog/core/cache/revalidatePublicContent', () => ({ revalidatePublicContent: vi.fn() }))
vi.mock('@blog/db/queries/admin/posts', () => ({
  createPost: vi.fn(async () => 'new-post'),
  createTranslation: vi.fn(async () => true),
  savePost: vi.fn(async () => '2026-10-22T10:00:00.000Z'),
  applyPostAction: vi.fn(async () => ({ ok: true, changedSite: true })),
  deletePost: vi.fn(async () => true),
}))

const postId = '11111111-1111-4111-8111-111111111111'
const base = 'https://whemotion.com/api/admin/posts/'
const json = (method: string, data: unknown) => new Request(base, { method, body: JSON.stringify(data) })
const at = (locale = 'es', id = postId) => ({ params: Promise.resolve({ postId: id, locale }) })
const save = {
  title: 'Hola',
  summary: '',
  content: { blocks: [] },
  cover: null,
  coverImageAuthor: '',
  coverImageSourceUrl: '',
  writerId: '',
  categoryIds: [],
}

describe('admin posts API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' }, expires: '' } as never)
  })

  it('should refuse every route without a session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    expect((await POST(json('POST', { locale: 'es' }))).status).toBe(401)
    expect((await DELETE(new Request(base), { params: Promise.resolve({ postId }) })).status).toBe(401)
    expect((await ADD_LANGUAGE(new Request(base), at())).status).toBe(401)
    expect((await PUT(json('PUT', save), at())).status).toBe(401)
    expect((await PATCH(json('PATCH', { action: 'publish' }), at())).status).toBe(401)
  })

  it('should create a post signed by whoever creates it', async () => {
    const response = await POST(json('POST', { locale: 'en' }))

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ id: 'new-post' })
    expect(createPost).toHaveBeenCalledWith('en', 'user-1')
    expect((await POST(json('POST', { locale: 'fr' }))).status).toBe(400)
  })

  it('should delete posts, refreshing the site', async () => {
    expect((await DELETE(new Request(base), { params: Promise.resolve({ postId }) })).status).toBe(204)
    expect(deletePost).toHaveBeenCalledWith(postId)
    expect(revalidatePublicContent).toHaveBeenCalled()

    vi.mocked(deletePost).mockResolvedValueOnce(false)
    expect((await DELETE(new Request(base), { params: Promise.resolve({ postId }) })).status).toBe(404)
    expect((await DELETE(new Request(base), { params: Promise.resolve({ postId: 'nope' }) })).status).toBe(404)
  })

  it('should add a missing language only', async () => {
    expect((await ADD_LANGUAGE(new Request(base), at('en'))).status).toBe(201)
    expect(createTranslation).toHaveBeenCalledWith(postId, 'en')

    vi.mocked(createTranslation).mockResolvedValueOnce(false)
    expect((await ADD_LANGUAGE(new Request(base), at('en'))).status).toBe(409)
    expect((await ADD_LANGUAGE(new Request(base), at('fr'))).status).toBe(409)
    expect((await ADD_LANGUAGE(new Request(base), at('es', 'nope'))).status).toBe(409)
  })

  it('should save without touching the site', async () => {
    const response = await PUT(json('PUT', save), at())

    await expect(response.json()).resolves.toEqual({ savedAt: '2026-10-22T10:00:00.000Z' })
    expect(savePost).toHaveBeenCalledWith(postId, 'es', expect.objectContaining({ title: 'Hola' }))
    expect(revalidatePublicContent).not.toHaveBeenCalled()

    vi.mocked(savePost).mockResolvedValueOnce(undefined)
    expect((await PUT(json('PUT', save), at())).status).toBe(404)
    expect((await PUT(json('PUT', save), at('fr'))).status).toBe(404)
    expect((await PUT(json('PUT', { ...save, title: 5 }), at())).status).toBe(400)
  })

  it('should apply actions, refreshing the site only when it changed', async () => {
    const response = await PATCH(json('PATCH', { action: 'publish' }), at())

    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(applyPostAction).toHaveBeenCalledWith(postId, 'es', { action: 'publish' })
    expect(revalidatePublicContent).toHaveBeenCalledTimes(1)

    vi.mocked(applyPostAction).mockResolvedValueOnce({ ok: true, changedSite: false })
    await PATCH(json('PATCH', { action: 'schedule', date: '2026-12-01' }), at())
    expect(revalidatePublicContent).toHaveBeenCalledTimes(1)
  })

  it('should explain refused actions', async () => {
    vi.mocked(applyPostAction).mockResolvedValueOnce({ ok: false, status: 409, error: 'Ya está publicada' })
    const refused = await PATCH(json('PATCH', { action: 'schedule', date: null }), at())

    expect(refused.status).toBe(409)
    await expect(refused.json()).resolves.toEqual({ error: 'Ya está publicada' })
    expect((await PATCH(json('PATCH', { action: 'publish' }), at('es', 'nope'))).status).toBe(404)
    expect((await PATCH(json('PATCH', { action: 'archive' }), at())).status).toBe(400)
  })
})
