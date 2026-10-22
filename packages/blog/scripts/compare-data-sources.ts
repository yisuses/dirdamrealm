/**
 * Compares what every data function returns from Strapi (production API) and from Neon, for
 * every published post and listing the site renders. Run before the cutover:
 *
 *   yarn db:compare
 *
 * Differences that are expected by design are normalised away (Cloudinary URLs, internal ids);
 * anything else is printed.
 */
import { readFileSync } from 'node:fs'
import { isDeepStrictEqual, parseEnv } from 'node:util'

Object.assign(process.env, { ...parseEnv(readFileSync('.env.local', 'utf8')), ...process.env })

type Json = unknown

function normaliseMedia(media: Media | null | undefined) {
  if (!media) return null
  return {
    width: media.width,
    height: media.height,
    caption: media.caption || null,
    formats: Object.fromEntries(
      Object.entries(media.formats ?? {})
        .filter(([, format]) => format)
        .map(([type, format]) => [type, { width: format!.width, height: format!.height }]),
    ),
  }
}

function normaliseCategory(category: Category) {
  const { code, main, name, translations, description, localizedName } = category
  return { code, main, name, translations, description, localizedName }
}

// Post 81 (es) was filed under NEW and HIS but its English version 79 only under NEW. The new
// schema files a post, not each language, so 79 gains HIS, and listings now include it directly
// with its cover instead of as a coverless translation of 81. Only its identity is compared.
const knownDivergentPosts = new Set([79])

function normalisePost(post: Post | null | undefined): Json {
  if (!post) return null
  if (knownDivergentPosts.has(post.id)) return { id: post.id, locale: post.locale, title: post.title }
  return {
    id: post.id,
    locale: post.locale,
    title: post.title,
    summary: post.summary,
    imgUrl: post.imgUrl || null,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    coverImageAuthor: post.coverImageAuthor || null,
    coverImageSourceUrl: post.coverImageSourceUrl || null,
    coverImage: normaliseMedia(post.coverImage),
    categories: post.categories?.map(normaliseCategory) ?? null,
    localizations: post.localizations?.map(normalisePost).sort((a, b) => (a as Post).id - (b as Post).id) ?? null,
    writer: post.writer
      ? { name: post.writer.name, twitter: post.writer.twitter, personalUrl: post.writer.personalUrl }
      : null,
    // Strapi's empty `mediaLib` placeholders are dropped by the migration on purpose.
    blocks: post.content.blocks
      .filter(block => block.type !== 'mediaLib')
      .map(block => ({ type: block.type, data: block.data })),
  }
}

function firstDifference(a: Json, b: Json, path = ''): string | null {
  if (isDeepStrictEqual(a, b)) return null
  // Strapi and Cloudinary round resized image dimensions differently: equal within a pixel.
  if (path.includes('.formats.') && typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= 1) return null
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of keys) {
      const diff = firstDifference((a as Record<string, Json>)[key], (b as Record<string, Json>)[key], `${path}.${key}`)
      if (diff) return diff
    }
    return null
  }
  const show = (v: Json) => JSON.stringify(v)?.slice(0, 160)
  return `${path || '(root)'}: strapi=${show(a)} neon=${show(b)}`
}

async function main() {
  const strapi = await import('@blog/api')
  const { getAllPosts: strapiGetAllPosts } = await import('@blog/api/post')
  const { getAboutFromDb } = await import('@blog/db/queries/about')
  const { getCategoriesFromDb } = await import('@blog/db/queries/categories')
  const { getCommentsFromDb } = await import('@blog/db/queries/comments')
  const { getAllPostsFromDb, getLatestPostsFromDb, getPostByIdFromDb } = await import('@blog/db/queries/posts')

  let checks = 0
  const failures: string[] = []
  const compare = (label: string, a: Json, b: Json) => {
    checks++
    const diff = firstDifference(a, b)
    if (diff) failures.push(`${label} → ${diff}`)
  }

  const [aboutA, aboutB] = await Promise.all([strapi.getAbout(), getAboutFromDb()])
  const aboutFields = (about?: About) =>
    about && {
      display: about.display,
      name: about.name,
      email: about.email,
      twitter: about.twitter,
      twitterUrl: about.twitterUrl,
      facebookUrl: about.facebookUrl,
      instagramUrl: about.instagramUrl,
      linkedinUrl: about.linkedinUrl,
    }
  compare('about', aboutFields(aboutA), aboutFields(aboutB))

  for (const locale of ['es', 'en'] as const) {
    const [a, b] = await Promise.all([strapi.getCategories({ locale }), getCategoriesFromDb({ locale })])
    compare(`categories ${locale}`, a.map(normaliseCategory), b.map(normaliseCategory))

    for (const params of [{ locale }, { locale, limit: 3 }, ...a.map(c => ({ locale, category: c.code }))]) {
      const [x, y] = await Promise.all([strapi.getLatestPosts(params), getLatestPostsFromDb(params)])
      compare(`latest ${JSON.stringify(params)}`, x?.map(normalisePost), y.map(normalisePost))
    }
  }

  // getAllPosts: Strapi caps at 100 rows per locale, so Neon is expected to return more.
  const [allA, allB] = await Promise.all([strapiGetAllPosts({}), getAllPostsFromDb({})])
  const idsA = new Set(allA?.map(p => p.id))
  const extra = allB.filter(p => !idsA.has(p.id))
  console.log(
    `getAllPosts: strapi ${allA?.length}, neon ${allB.length}; only in neon: ${extra.map(p => p.id).join(', ')}`,
  )
  const byId = new Map(allB.map(p => [p.id, p]))
  for (const post of allA ?? []) {
    compare(`all #${post.id}`, normalisePost(post), normalisePost(byId.get(post.id)))
  }

  for (const { id } of allB) {
    const [a, b] = await Promise.all([strapi.getPostById({ id }), getPostByIdFromDb({ id })])
    compare(`post #${id}`, normalisePost(a), normalisePost(b))
    if (b) {
      const ids = [...(b.localizations ?? []).map(l => l.id), b.id]
      const [ca, cb] = await Promise.all([strapi.getComments({ ids }), getCommentsFromDb({ ids })])
      const shape = (list: Commentary[]) =>
        list.map(({ id, author, text, createdAt }) => ({ id, author, text, createdAt }))
      // Strapi returns at most 25 comments; Neon returns all of them.
      compare(`comments #${id}`, shape(ca), shape(cb).slice(0, 25))
    }
  }

  console.log(`\n${checks} checks, ${failures.length} with differences`)
  failures.forEach(line => console.log(`- ${line}`))
  process.exitCode = failures.length ? 1 : 0
  const { getDb } = await import('@blog/db/client')
  await (getDb().$client as { end: () => Promise<void> }).end()
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
