/* eslint-disable @typescript-eslint/naming-convention */
import { QueryKey } from '@tanstack/react-query'

export const DATE_FORMAT = 'dd.MM.yyyy'

export const QUERY_ABOUT: QueryKey = ['about']
export const QUERY_CATEGORIES: QueryKey = ['categories']
export const QUERY_LATEST_POSTS: QueryKey = ['latestPosts', 'HomePage']
export const getCategoryCodeKey = (categoryCode: string): QueryKey => ['category', categoryCode]
export const getLatestPostsCategoryKey = (categoryCode: string): QueryKey => ['latestPostsCategoryPage', categoryCode]
export const getPostKey = (postId: number): QueryKey => ['post', postId]
export const getPostCommentsKey = (postIds: number[]): QueryKey => ['postComments', postIds.join()]
