import { afterEach, describe, expect, it, vi } from 'vitest'

import * as strapi from '@blog/api'
import * as strapiComment from '@blog/api/comment'
import * as strapiPosts from '@blog/api/post'
import * as dbComment from '@blog/core/comments/addCommentToDb'
import * as about from '@blog/db/queries/about'
import * as categories from '@blog/db/queries/categories'
import * as comments from '@blog/db/queries/comments'
import * as posts from '@blog/db/queries/posts'

import * as data from '.'

vi.mock('server-only', () => ({}))
vi.mock('@blog/api', () => ({
  getAbout: vi.fn(() => 'strapi:about'),
  getCategories: vi.fn(() => 'strapi:categories'),
  getLatestPosts: vi.fn(() => 'strapi:latest'),
  getPostById: vi.fn(() => 'strapi:post'),
  getComments: vi.fn(() => 'strapi:comments'),
}))
vi.mock('@blog/api/comment', () => ({ addComment: vi.fn(async () => ({ data: {} })) }))
vi.mock('@blog/core/comments/addCommentToDb', () => ({ addCommentToDb: vi.fn(async () => false) }))
vi.mock('@blog/api/post', () => ({
  getAllPosts: vi.fn(() => 'strapi:all'),
  getAlgoliaPosts: vi.fn(() => 'algolia:search'),
}))
vi.mock('@blog/db/queries/about', () => ({ getAboutFromDb: vi.fn(() => 'db:about') }))
vi.mock('@blog/db/queries/categories', () => ({ getCategoriesFromDb: vi.fn(() => 'db:categories') }))
vi.mock('@blog/db/queries/comments', () => ({ getCommentsFromDb: vi.fn(() => 'db:comments') }))
vi.mock('@blog/db/queries/posts', () => ({
  getLatestPostsFromDb: vi.fn(() => 'db:latest'),
  getAllPostsFromDb: vi.fn(() => 'db:all'),
  getPostByIdFromDb: vi.fn(() => 'db:post'),
  searchPostsFromDb: vi.fn(() => 'db:search'),
}))

const calls = () => ({
  about: data.getAbout(),
  categories: data.getCategories({ locale: 'es' }),
  latest: data.getLatestPosts({ limit: 3 }),
  all: data.getAllPosts({ locale: 'en' }),
  post: data.getPostById({ id: 7 }),
  comments: data.getComments({ ids: [7] }),
  search: data.searchPosts({ query: 'hola' }),
})

describe('data source', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('should read from Strapi by default, searching with Algolia', () => {
    expect(data.dataSource()).toBe('strapi')
    expect(calls()).toEqual({
      about: 'strapi:about',
      categories: 'strapi:categories',
      latest: 'strapi:latest',
      all: 'strapi:all',
      post: 'strapi:post',
      comments: 'strapi:comments',
      search: 'algolia:search',
    })
    expect(strapi.getCategories).toHaveBeenCalledWith({ locale: 'es' })
    expect(strapiPosts.getAlgoliaPosts).toHaveBeenCalledWith({ query: 'hola' })
  })

  it('should read from Neon when DATA_SOURCE is db, passing the same parameters', () => {
    vi.stubEnv('DATA_SOURCE', 'db')

    expect(data.dataSource()).toBe('db')
    expect(calls()).toEqual({
      about: 'db:about',
      categories: 'db:categories',
      latest: 'db:latest',
      all: 'db:all',
      post: 'db:post',
      comments: 'db:comments',
      search: 'db:search',
    })
    expect(about.getAboutFromDb).toHaveBeenCalled()
    expect(categories.getCategoriesFromDb).toHaveBeenCalledWith({ locale: 'es' })
    expect(posts.getLatestPostsFromDb).toHaveBeenCalledWith({ limit: 3 })
    expect(posts.getAllPostsFromDb).toHaveBeenCalledWith({ locale: 'en' })
    expect(posts.getPostByIdFromDb).toHaveBeenCalledWith({ id: 7 })
    expect(comments.getCommentsFromDb).toHaveBeenCalledWith({ ids: [7] })
    expect(posts.searchPostsFromDb).toHaveBeenCalledWith({ query: 'hola' })
  })

  it('should send comments to Strapi by default, and to Neon when DATA_SOURCE is db', async () => {
    const comment = { postId: 7, author: 'Ana', text: 'Hola' }

    await expect(data.addComment(comment)).resolves.toBe(true)
    expect(strapiComment.addComment).toHaveBeenCalledWith(comment)

    vi.stubEnv('DATA_SOURCE', 'db')
    await expect(data.addComment(comment)).resolves.toBe(false)
    expect(dbComment.addCommentToDb).toHaveBeenCalledWith(comment)
  })

  it('should treat any other value as Strapi', () => {
    vi.stubEnv('DATA_SOURCE', 'neon')

    expect(data.dataSource()).toBe('strapi')
  })
})
