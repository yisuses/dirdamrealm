import * as sentry from '@sentry/nextjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@blog/core/auth/config'
import { deleteImage, getImage, listImages, signUpload, updateImage } from '@blog/core/cloudinary/library'
import { findImageUsage } from '@blog/db/queries/admin/images'

import { DELETE, PATCH } from './[publicId]/route'
import { GET } from './route'
import { POST as SIGN } from './signature/route'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
vi.mock('@blog/core/auth/config', () => ({ auth: vi.fn() }))
vi.mock('@blog/core/cloudinary/library', () => ({
  listImages: vi.fn(async () => ({ images: [], total: 0, nextCursor: null })),
  getImage: vi.fn(async () => ({ publicId: 'foto' })),
  updateImage: vi.fn(async (publicId: string, meta: object) => ({ publicId, ...meta })),
  deleteImage: vi.fn(),
  signUpload: vi.fn(() => ({ url: 'https://upload', fields: { signature: 's' } })),
}))
vi.mock('@blog/db/queries/admin/images', () => ({ findImageUsage: vi.fn(async () => []) }))

const base = 'https://whemotion.com/api/admin/images/'
const json = (method: string, data: unknown) => new Request(base, { method, body: JSON.stringify(data) })
const context = (publicId: string) => ({ params: Promise.resolve({ publicId }) })
const meta = { name: 'Sol', alt: 'Un sol' }

describe('admin images API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'me' }, expires: '' } as never)
  })

  it('should refuse every route without a session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    expect((await GET(new Request(base))).status).toBe(401)
    expect((await SIGN(json('POST', meta))).status).toBe(401)
    expect((await PATCH(json('PATCH', meta), context('foto'))).status).toBe(401)
    expect((await DELETE(new Request(base), context('foto'))).status).toBe(401)
    expect(listImages).not.toHaveBeenCalled()
    expect(deleteImage).not.toHaveBeenCalled()
  })

  it('should list a page, passing the search (capped) and cursor', async () => {
    const response = await GET(new Request(`${base}?q=${'a'.repeat(150)}&cursor=next`))

    await expect(response.json()).resolves.toEqual({ images: [], total: 0, nextCursor: null })
    expect(listImages).toHaveBeenCalledWith({ query: 'a'.repeat(100), cursor: 'next' })

    await GET(new Request(base))
    expect(listImages).toHaveBeenLastCalledWith({ query: '', cursor: undefined })
  })

  it('should explain when Cloudinary cannot list', async () => {
    vi.mocked(listImages).mockRejectedValueOnce(new Error('rate limited'))

    const response = await GET(new Request(base))

    expect(response.status).toBe(502)
    expect(sentry.captureException).toHaveBeenCalled()
  })

  it('should sign uploads with a valid name only', async () => {
    const response = await SIGN(json('POST', meta))

    await expect(response.json()).resolves.toEqual({ url: 'https://upload', fields: { signature: 's' } })
    expect(signUpload).toHaveBeenCalledWith(meta)
    expect((await SIGN(json('POST', { name: '', alt: '' }))).status).toBe(400)
  })

  it('should rename and describe existing images', async () => {
    const response = await PATCH(json('PATCH', { name: ' Sol ', alt: '' }), context('foto'))

    await expect(response.json()).resolves.toEqual({ publicId: 'foto', name: 'Sol', alt: '' })
    expect(updateImage).toHaveBeenCalledWith('foto', { name: 'Sol', alt: '' })

    expect((await PATCH(json('PATCH', meta), context('a/b'))).status).toBe(404)
    vi.mocked(getImage).mockResolvedValueOnce(undefined)
    expect((await PATCH(json('PATCH', meta), context('nope'))).status).toBe(404)
    vi.mocked(getImage).mockRejectedValueOnce(new Error('down'))
    expect((await PATCH(json('PATCH', meta), context('foto'))).status).toBe(502)
    expect((await PATCH(json('PATCH', { alt: '' }), context('foto'))).status).toBe(400)
  })

  it('should delete unused images only', async () => {
    expect((await DELETE(new Request(base), context('foto'))).status).toBe(204)
    expect(deleteImage).toHaveBeenCalledWith('foto')

    const usage = [{ number: 1, locale: 'es', title: 'T', status: 'published', cover: true, content: false }]
    vi.mocked(findImageUsage).mockResolvedValueOnce(usage as never)
    const inUse = await DELETE(new Request(base), context('portada'))
    expect(inUse.status).toBe(409)
    await expect(inUse.json()).resolves.toMatchObject({ usage })
    expect(deleteImage).toHaveBeenCalledTimes(1)
  })

  it('should not delete unknown images and explain Cloudinary failures', async () => {
    expect((await DELETE(new Request(base), context('../x'))).status).toBe(404)
    vi.mocked(getImage).mockResolvedValueOnce(undefined)
    expect((await DELETE(new Request(base), context('nope'))).status).toBe(404)
    vi.mocked(deleteImage).mockRejectedValueOnce(new Error('down'))
    expect((await DELETE(new Request(base), context('foto'))).status).toBe(502)
  })
})
