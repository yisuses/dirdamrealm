import slugify from 'slugify'

export function seoName(str: string): string {
  // Guard against non-string/empty input so a partial API record never crashes a build
  // (slugify throws "string argument expected" otherwise).
  if (typeof str !== 'string' || !str) {
    return ''
  }
  return slugify(str, {
    strict: true,
    lower: true,
  })
}
