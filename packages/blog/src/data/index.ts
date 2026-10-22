import 'server-only'

import * as strapi from '@blog/api'
import { getAlgoliaPosts, getAllPosts as getAllPostsFromStrapi } from '@blog/api/post'
import { getAboutFromDb } from '@blog/db/queries/about'
import { getCategoriesFromDb } from '@blog/db/queries/categories'
import { getCommentsFromDb } from '@blog/db/queries/comments'
import { getAllPostsFromDb, getLatestPostsFromDb, getPostByIdFromDb, searchPostsFromDb } from '@blog/db/queries/posts'

/**
 * Where the site reads its content from. `strapi` (the default) until the cutover, `db` (Neon)
 * after it; switching back is the rollback. See docs/strapi-to-vercel-migration.md.
 */
export function dataSource(): 'strapi' | 'db' {
  return process.env.DATA_SOURCE === 'db' ? 'db' : 'strapi'
}

const fromDb = () => dataSource() === 'db'

export const getAbout = () => (fromDb() ? getAboutFromDb() : strapi.getAbout())

export const getCategories = (params: Parameters<typeof strapi.getCategories>[0]) =>
  fromDb() ? getCategoriesFromDb(params) : strapi.getCategories(params)

export const getLatestPosts = (params: Parameters<typeof strapi.getLatestPosts>[0]) =>
  fromDb() ? getLatestPostsFromDb(params) : strapi.getLatestPosts(params)

export const getAllPosts = (params: Parameters<typeof getAllPostsFromStrapi>[0]) =>
  fromDb() ? getAllPostsFromDb(params) : getAllPostsFromStrapi(params)

export const getPostById = (params: Parameters<typeof strapi.getPostById>[0]) =>
  fromDb() ? getPostByIdFromDb(params) : strapi.getPostById(params)

export const getComments = (params: Parameters<typeof strapi.getComments>[0]) =>
  fromDb() ? getCommentsFromDb(params) : strapi.getComments(params)

/** The header's quick search: Algolia while on Strapi, Postgres once on Neon. */
export const searchPosts = (params: { query: string }) =>
  fromDb() ? searchPostsFromDb(params) : getAlgoliaPosts(params)
