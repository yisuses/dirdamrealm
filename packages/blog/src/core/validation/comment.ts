import { z } from 'zod'

/** A visitor's comment, with the same limits the post page's form shows. */
export const commentSchema = z.object({
  postId: z.number().int().positive(),
  author: z.string().trim().min(4).max(40),
  text: z.string().trim().min(4).max(3000),
  captcha: z.string().min(1).max(4000),
})

export type CommentInput = z.infer<typeof commentSchema>

/** Comments per page in the panel's list. */
export const commentListPageSize = 25
