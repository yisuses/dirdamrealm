import { isServeablePath } from './isServeablePath'

describe('isServeablePath', () => {
  it('should accept the home page with and without a locale prefix', () => {
    expect(isServeablePath('/')).toBe(true)
    expect(isServeablePath('/en/')).toBe(true)
    expect(isServeablePath('/es/')).toBe(true)
  })

  it('should accept the list pages', () => {
    expect(isServeablePath('/archive/')).toBe(true)
    expect(isServeablePath('/post/')).toBe(true)
    expect(isServeablePath('/category/')).toBe(true)
    expect(isServeablePath('/en/archive/')).toBe(true)
  })

  it('should accept canonical post urls', () => {
    expect(isServeablePath('/post/310/eclipsoe/')).toBe(true)
    expect(isServeablePath('/es/post/302/12-de-agosto-2026-eclipse-total-en-espana/')).toBe(true)
    expect(isServeablePath('/en/post/296/')).toBe(true)
  })

  it('should accept canonical category urls, including the legacy `categoria` alias', () => {
    expect(isServeablePath('/category/SPO/deportes/')).toBe(true)
    expect(isServeablePath('/category/MAC/')).toBe(true)
    expect(isServeablePath('/categoria/ENG/ingenieria/')).toBe(true)
  })

  it('should let non-page paths through', () => {
    expect(isServeablePath('/robots.txt')).toBe(true)
    // ...but not urls that merely start with one.
    expect(isServeablePath('/robots.txt/post/1/junk/')).toBe(false)
  })

  it('should reject unknown sections', () => {
    expect(isServeablePath('/wp-admin/')).toBe(false)
    expect(isServeablePath('/.env')).toBe(false)
    expect(isServeablePath('/en/wp-login.php')).toBe(false)
  })

  it('should reject paths that bypassed the old dot-matcher', () => {
    // The previous proxy matcher skipped any path containing a dot, so these reached the
    // app and were ISR-cached as 404s.
    expect(isServeablePath('/sitemap_index.xml/post/1/junk/')).toBe(false)
    expect(isServeablePath('/robots.txt/post/1/junk/')).toBe(false)
  })

  it('should reject extra trailing segments', () => {
    expect(isServeablePath('/post/310/eclipsoe/extra/')).toBe(false)
    expect(isServeablePath('/category/SPO/deportes/extra/')).toBe(false)
  })

  it('should reject params on the archive page', () => {
    expect(isServeablePath('/archive/2026/')).toBe(false)
  })

  it('should reject non-numeric post ids', () => {
    expect(isServeablePath('/post/abc/')).toBe(false)
    expect(isServeablePath('/post/310a/eclipsoe/')).toBe(false)
    expect(isServeablePath(`/post/${'9'.repeat(10)}/`)).toBe(false)
  })

  it('should reject category codes that are not uppercase letters', () => {
    expect(isServeablePath('/category/spo/')).toBe(false)
    expect(isServeablePath('/category/SPO1/deportes/')).toBe(false)
    expect(isServeablePath(`/category/${'A'.repeat(17)}/`)).toBe(false)
  })

  it('should reject slugs that `seoName` could never produce', () => {
    expect(isServeablePath('/post/310/Eclipsoe/')).toBe(false)
    expect(isServeablePath('/post/310/eclipsoe.php/')).toBe(false)
    expect(isServeablePath('/post/310/eclipso%20e/')).toBe(false)
    expect(isServeablePath('/post/310/-eclipsoe/')).toBe(false)
    expect(isServeablePath('/post/310/eclipsoe--x/')).toBe(false)
    expect(isServeablePath('/category/SPO/Deportes/')).toBe(false)
  })

  it('should reject slugs longer than the limit', () => {
    expect(isServeablePath(`/post/310/${'a'.repeat(120)}/`)).toBe(true)
    expect(isServeablePath(`/post/310/${'a'.repeat(121)}/`)).toBe(false)
  })
})
