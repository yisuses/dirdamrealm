import slugify from 'slugify'

export function seoName(str: string): string {
  return slugify(str, {
    strict: true,
    lower: true,
  })
}
