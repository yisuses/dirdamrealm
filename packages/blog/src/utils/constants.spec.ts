import { describe, expect, it } from 'vitest'

import {
  getAlgoliaPostKey,
  getArchivePostsKey,
  getCategoriesKey,
  getCategoryCodeKey,
  getLatestPostsKey,
  getPostCommentsKey,
  getPostKey,
  xmlUrlSet,
} from './constants'

describe('query keys', () => {
  it('should build the keys from their arguments', () => {
    expect(getCategoriesKey()).toEqual(['categories', 'en'])
    expect(getCategoriesKey('es')).toEqual(['categories', 'es'])
    expect(getArchivePostsKey('ENG')).toEqual(['archivePosts', 'ENG'])
    expect(getLatestPostsKey()).toEqual(['latestPosts', ''])
    expect(getLatestPostsKey('ENG')).toEqual(['latestPosts', 'ENG'])
    expect(getCategoryCodeKey('ENG')).toEqual(['category', 'ENG'])
    expect(getPostKey(1)).toEqual(['post', 1])
    expect(getPostCommentsKey([1, 2])).toEqual(['postComments', '1,2'])
    expect(getAlgoliaPostKey('hola')).toEqual(['algoliaPosts', { debouncedValue: 'hola' }])
  })
})

describe('xmlUrlSet', () => {
  it('should wrap the content in a sitemap urlset', () => {
    const xml = xmlUrlSet('<url />')

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toMatch(/<urlset[^>]*>\s*<url \/>\s*<\/urlset>/)
  })
})
