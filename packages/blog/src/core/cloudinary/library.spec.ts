import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteImage, getImage, listImages, signUpload, updateImage } from './library'
import { toLibraryImage } from './libraryImage'

const cloudinary = vi.hoisted(() => {
  const search = {
    expression: vi.fn(),
    with_field: vi.fn(),
    sort_by: vi.fn(),
    max_results: vi.fn(),
    next_cursor: vi.fn(),
    execute: vi.fn(),
  }
  for (const method of ['expression', 'with_field', 'sort_by', 'max_results', 'next_cursor'] as const) {
    search[method].mockReturnValue(search)
  }
  return {
    config: vi.fn(),
    search,
    api: { resource: vi.fn(), update: vi.fn(), delete_resources: vi.fn() },
    utils: { api_sign_request: vi.fn(() => 'signed') },
  }
})
vi.mock('server-only', () => ({}))
vi.mock('cloudinary', () => ({ v2: cloudinary }))

const resource = (overrides = {}) => ({
  public_id: 'portada_tirol_1_1c134c9339',
  width: 1200,
  height: 800,
  format: 'png',
  bytes: 2048,
  created_at: '2026-10-20T12:00:00Z',
  ...overrides,
})
const withoutCopies = 'NOT (public_id:thumbnail_* OR public_id:small_* OR public_id:medium_* OR public_id:large_*)'

describe('Cloudinary library', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'demo')
    vi.stubEnv('CLOUDINARY_API_KEY', 'key')
    vi.stubEnv('CLOUDINARY_API_SECRET', 'secret')
  })

  it('should configure the SDK from the environment on every call', async () => {
    cloudinary.search.execute.mockResolvedValue({ resources: [], total_count: 0 })
    await listImages({})

    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'demo',
      api_key: 'key',
      api_secret: 'secret',
      secure: true,
    })
  })

  it('should list originals newest first, naming Strapi uploads after their id', async () => {
    cloudinary.search.execute.mockResolvedValue({
      resources: [resource(), resource({ public_id: 'mi-foto', context: { name: 'Mi foto', alt: 'Una foto' } })],
      total_count: 2,
      next_cursor: 'next',
    })

    await expect(listImages({})).resolves.toEqual({
      images: [
        expect.objectContaining({ publicId: 'portada_tirol_1_1c134c9339', name: 'portada tirol 1', alt: '' }),
        expect.objectContaining({ publicId: 'mi-foto', name: 'Mi foto', alt: 'Una foto' }),
      ],
      total: 2,
      nextCursor: 'next',
    })
    expect(cloudinary.search.expression).toHaveBeenCalledWith(`resource_type:image AND ${withoutCopies}`)
    expect(cloudinary.search.with_field).toHaveBeenCalledWith('context')
    expect(cloudinary.search.sort_by).toHaveBeenCalledWith('created_at', 'desc')
    expect(cloudinary.search.max_results).toHaveBeenCalledWith(30)
    expect(cloudinary.search.next_cursor).not.toHaveBeenCalled()
  })

  it('should search word prefixes without accents or operators, continuing from a cursor', async () => {
    cloudinary.search.execute.mockResolvedValue({ resources: [], total_count: 0 })

    await expect(listImages({ query: ' Bernabéu "OR" a:b* 1 2 3 4', cursor: 'abc' })).resolves.toEqual({
      images: [],
      total: 0,
      nextCursor: null,
    })
    expect(cloudinary.search.expression).toHaveBeenCalledWith(
      `resource_type:image AND bernabeu* AND or* AND a* AND b* AND 1* AND ${withoutCopies}`,
    )
    expect(cloudinary.search.next_cursor).toHaveBeenCalledWith('abc')

    await listImages({ query: '¿?' })
    expect(cloudinary.search.expression).toHaveBeenLastCalledWith(`resource_type:image AND ${withoutCopies}`)
  })

  it('should read one image, but not Strapi copies or missing ones', async () => {
    cloudinary.api.resource.mockResolvedValueOnce(resource({ context: { custom: { name: 'Tirol', alt: 'Montañas' } } }))
    await expect(getImage('portada_tirol_1_1c134c9339')).resolves.toMatchObject({ name: 'Tirol', alt: 'Montañas' })
    expect(cloudinary.api.resource).toHaveBeenCalledWith('portada_tirol_1_1c134c9339', { context: true })

    await expect(getImage('small_portada_tirol_1_1c134c9339')).resolves.toBeUndefined()
    expect(cloudinary.api.resource).toHaveBeenCalledTimes(1)

    cloudinary.api.resource.mockRejectedValueOnce({ error: { http_code: 404 } })
    await expect(getImage('nope')).resolves.toBeUndefined()

    cloudinary.api.resource.mockRejectedValueOnce(new Error('down'))
    await expect(getImage('nope')).rejects.toThrow('down')
  })

  it('should store the name, a searchable copy without accents and the description, escaping separators', async () => {
    cloudinary.api.update.mockResolvedValue(resource({ context: { custom: { name: 'Sol = luz', alt: 'a|b' } } }))

    await expect(updateImage('foto', { name: 'Sol = luz ñ', alt: 'a|b' })).resolves.toMatchObject({ name: 'Sol = luz' })
    expect(cloudinary.api.update).toHaveBeenCalledWith('foto', {
      context: 'name=Sol \\= luz ñ|alt=a\\|b|search=Sol \\= luz n',
    })
  })

  it('should delete an image with the copies Strapi made of it', async () => {
    await deleteImage('foto_1')

    expect(cloudinary.api.delete_resources).toHaveBeenCalledWith(
      ['foto_1', 'thumbnail_foto_1', 'small_foto_1', 'medium_foto_1', 'large_foto_1'],
      { invalidate: true },
    )
  })

  it('should sign an upload with a readable, unique id built from the name', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)

    const signed = signUpload({ name: 'Puerta del Sol, 1990', alt: '' })

    expect(signed.url).toBe('https://api.cloudinary.com/v1_1/demo/image/upload')
    expect(signed.fields).toEqual({
      public_id: expect.stringMatching(/^puerta_del_sol_1990_[\da-f]{10}$/),
      context: 'name=Puerta del Sol, 1990|alt=|search=Puerta del Sol, 1990',
      allowed_formats: 'jpg,jpeg,png,webp,gif,avif,heic',
      timestamp: 1_700_000_000,
      api_key: 'key',
      signature: 'signed',
    })
    const { api_key: apiKey, signature, ...signedParams } = signed.fields
    expect([apiKey, signature]).toEqual(['key', 'signed'])
    expect(cloudinary.utils.api_sign_request).toHaveBeenCalledWith(signedParams, 'secret')
    expect(signUpload({ name: '¡¿?!', alt: '' }).fields.public_id).toMatch(/^imagen_[\da-f]{10}$/)
  })

  it('should read uploads and Admin API answers, which nest the fields under `custom`', () => {
    expect(toLibraryImage(resource({ context: { custom: { name: 'Tirol' } } }))).toEqual({
      publicId: 'portada_tirol_1_1c134c9339',
      name: 'Tirol',
      alt: '',
      width: 1200,
      height: 800,
      format: 'png',
      bytes: 2048,
      createdAt: '2026-10-20T12:00:00Z',
    })
    expect(toLibraryImage(resource({ public_id: 'mi_foto-2' })).name).toBe('mi foto 2')
  })
})
