import { lookup } from 'node:dns/promises'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchLinkPreview, isPrivateAddress } from './linkPreview'

vi.mock('node:dns/promises', () => ({ lookup: vi.fn() }))

const fetchMock = vi.fn()
const html = (body: string, headers: [string, string][] = [['content-type', 'text/html; charset=utf-8']]) =>
  new Response(body, { status: 200, headers: new Headers(headers) })
const redirect = (location: string) =>
  new Response(null, { status: 301, headers: new Headers([['location', location]]) })

describe('isPrivateAddress', () => {
  it.each(['10.0.0.1', '127.0.0.1', '0.0.0.0', '224.0.0.1', '100.64.0.1', '169.254.1.1', '172.16.0.1', '192.168.1.1'])(
    'should refuse the private IPv4 %s',
    ip => expect(isPrivateAddress(ip)).toBe(true),
  )

  it.each(['8.8.8.8', '100.63.0.1', '100.128.0.1', '172.32.0.1', '169.253.0.1', '192.169.0.1'])(
    'should accept the public IPv4 %s',
    ip => expect(isPrivateAddress(ip)).toBe(false),
  )

  it.each(['::', '::1', 'fc00::1', 'FD12::1', 'fe80::1', 'febf::1', 'ff02::1', '::ffff:10.0.0.1'])(
    'should refuse the private IPv6 %s',
    ip => expect(isPrivateAddress(ip)).toBe(true),
  )

  it.each(['2001:db8::1', '::ffff:8.8.8.8'])('should accept the public IPv6 %s', ip =>
    expect(isPrivateAddress(ip)).toBe(false),
  )
})

describe('fetchLinkPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    vi.mocked(lookup).mockResolvedValue([{ address: '93.184.216.34', family: 4 }] as never)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should read the Open Graph title, description and image, decoding entities', async () => {
    fetchMock.mockResolvedValueOnce(
      html(`<html><head>
        <meta property="og:title" content="Tom &amp; Jerry&#39;s &quot;show&quot; &lt;3 &#x41;&#65; &apos;ok&apos; &gt;">
        <meta name="description" content='Una descripción'>
        <meta property="og:image" content="/img/portada.jpg">
        <meta name="viewport">
        <title>Ignorado</title>
      </head></html>`),
    )

    await expect(fetchLinkPreview('https://example.com/articulo')).resolves.toEqual({
      title: `Tom & Jerry's "show" <3 AA 'ok' >`,
      description: 'Una descripción',
      image: 'https://example.com/img/portada.jpg',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://example.com/articulo'),
      expect.objectContaining({ redirect: 'manual' }),
    )
    expect(lookup).toHaveBeenCalledWith('example.com', { all: true })
  })

  it('should fall back to the page title or the host, drop http images and cap lengths', async () => {
    fetchMock
      .mockResolvedValueOnce(
        html(`<title>${'T'.repeat(400)}</title><meta property="og:image" content="http://example.com/a.jpg">`),
      )
      .mockResolvedValueOnce(html('<p>sin nada</p>'))

    const titled = await fetchLinkPreview('https://example.com/')
    expect(titled).toEqual({ title: 'T'.repeat(300), description: '', image: '' })
    await expect(fetchLinkPreview('https://example.com/')).resolves.toEqual({
      title: 'example.com',
      description: '',
      image: '',
    })
  })

  it('should follow a few redirects, checking each address', async () => {
    fetchMock.mockResolvedValueOnce(redirect('/nuevo')).mockResolvedValueOnce(html('<title>Llegué</title>'))

    await expect(fetchLinkPreview('https://example.com/viejo')).resolves.toMatchObject({ title: 'Llegué' })
    expect(fetchMock).toHaveBeenLastCalledWith(new URL('https://example.com/nuevo'), expect.anything())

    fetchMock.mockResolvedValue(redirect('/otra'))
    await expect(fetchLinkPreview('https://example.com/bucle')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(2 + 4)

    fetchMock.mockReset().mockResolvedValueOnce(redirect('http://127.0.0.1/admin'))
    await expect(fetchLinkPreview('https://example.com/')).resolves.toBeUndefined()
  })

  it('should stop reading long pages', async () => {
    fetchMock.mockResolvedValueOnce(
      html(`<title>Larga</title>${'x'.repeat(700 * 1024)}<meta property="og:title" content="Tarde">`),
    )

    await expect(fetchLinkPreview('https://example.com/')).resolves.toMatchObject({ title: 'Larga' })
  })

  it('should give nothing for failed answers or other content', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('no', { status: 404, headers: new Headers([['content-type', 'text/html']]) }))
      .mockResolvedValueOnce(html('{}', [['content-type', 'application/json']]))
      .mockResolvedValueOnce(new Response('x', { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 302 }))

    for (let i = 0; i < 4; i++) {
      await expect(fetchLinkPreview('https://example.com/')).resolves.toBeUndefined()
    }
  })

  it('should refuse addresses that are not public websites, without fetching them', async () => {
    vi.mocked(lookup)
      .mockResolvedValueOnce([{ address: '10.0.0.5', family: 4 }] as never)
      .mockResolvedValueOnce([] as never)
      .mockRejectedValueOnce(new Error('ENOTFOUND'))

    for (const address of [
      'no es una dirección',
      'ftp://example.com/',
      'https://example.com:8443/',
      'https://usuario:clave@example.com/',
      'http://127.0.0.1/',
      'http://[::1]/',
      'https://interna.example.com/',
      'https://vacia.example.com/',
      'https://noexiste.example.com/',
    ]) {
      await expect(fetchLinkPreview(address)).resolves.toBeUndefined()
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('should fetch public IP literals without asking DNS', async () => {
    fetchMock.mockResolvedValueOnce(html('<title>IP</title>'))

    await expect(fetchLinkPreview('http://8.8.8.8/')).resolves.toMatchObject({ title: 'IP' })
    expect(lookup).not.toHaveBeenCalled()
  })
})
