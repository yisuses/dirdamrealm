import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

export interface LinkPreview {
  title: string
  description: string
  image: string
}

const maxBytes = 512 * 1024
const maxRedirects = 3

function isPrivateIPv4(ip: string) {
  const [a, b] = ip.split('.').map(Number) as [number, number]
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  )
}

/** Loopback, private, link-local, multicast or reserved: never a public website. */
export function isPrivateAddress(ip: string) {
  if (isIP(ip) === 4) {
    return isPrivateIPv4(ip)
  }
  const lower = ip.toLowerCase()
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) {
    return isPrivateIPv4(mapped[1]!)
  }
  return lower === '::' || lower === '::1' || /^f[cd]/.test(lower) || /^fe[89ab]/.test(lower) || lower.startsWith('ff')
}

/**
 * Only public websites on the standard ports, so the panel cannot be used to reach the server's
 * own network. (A DNS answer could still change between this check and the fetch; the endpoint
 * is only open to the panel's users, which keeps that risk small.)
 */
async function isPublicUrl(url: URL) {
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || url.port || url.username || url.password) {
    return false
  }
  const host = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => [])
  return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address))
}

async function readText(response: Response) {
  const reader = response.body!.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (size < maxBytes) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(value)
    size += value.length
  }
  await reader.cancel()
  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, maxBytes))
}

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
}

function metaContent(html: string, names: string[]) {
  for (const tag of html.match(/<meta\s[^>]*>/gi) ?? []) {
    const key = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()
    const content = tag.match(/\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i)
    if (key && names.includes(key) && content) {
      return decodeEntities(content[1] ?? content[2]!)
    }
  }
  return ''
}

function parsePreview(html: string, base: URL): LinkPreview {
  const title =
    metaContent(html, ['og:title', 'twitter:title']) ||
    decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '') ||
    base.hostname
  const description = metaContent(html, ['og:description', 'twitter:description', 'description'])
  const imageSource = metaContent(html, ['og:image', 'og:image:secure_url', 'twitter:image'])
  let image = ''
  if (imageSource) {
    const resolved = new URL(imageSource, base)
    image = resolved.protocol === 'https:' ? resolved.href : ''
  }
  return { title: title.slice(0, 300), description: description.slice(0, 500), image }
}

/** Title, description and image of a public web page, as social networks show links. */
export async function fetchLinkPreview(address: string): Promise<LinkPreview | undefined> {
  let url: URL
  try {
    url = new URL(address)
  } catch {
    return undefined
  }
  for (let hop = 0; hop <= maxRedirects; hop++) {
    if (!(await isPublicUrl(url))) {
      return undefined
    }
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
      headers: new Headers([
        ['accept', 'text/html'],
        ['user-agent', 'Mozilla/5.0 (compatible; WhemotionLinkPreview/1.0)'],
      ]),
    })
    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url)
      continue
    }
    if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) {
      return undefined
    }
    return parsePreview(await readText(response), url)
  }
  return undefined
}
