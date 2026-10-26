import { describe, expect, it } from 'vitest'

import { newCommentEmail } from './newCommentEmail'

describe('newCommentEmail', () => {
  const email = newCommentEmail({
    author: 'Ana <script>',
    text: 'Me encanta & lo comparto\n<b>gracias</b>',
    postTitle: 'Tapestry "1971"',
    commentUrl: 'https://whemotion.com/post/1/tapestry/#comment-5',
    panelUrl: 'https://whemotion.com/admin/comentarios/',
  })

  it('should say who commented where in the subject and the plain text', () => {
    expect(email.subject).toBe('Emoción Blanca: nuevo comentario de Ana <script> en «Tapestry "1971"»')
    expect(email.text).toBe(
      [
        'Ana <script> ha comentado en «Tapestry "1971"»:',
        '',
        'Me encanta & lo comparto\n<b>gracias</b>',
        '',
        'Verlo en la web: https://whemotion.com/post/1/tapestry/#comment-5',
        'Si hay que borrarlo, desde el panel: https://whemotion.com/admin/comentarios/',
      ].join('\n'),
    )
  })

  it("should escape the visitor's words in the html and link to the comment and the panel", () => {
    expect(email.html).toContain('<b>Ana &#60;script&#62;</b> ha comentado en «Tapestry &#34;1971&#34;»')
    expect(email.html).toContain('Me encanta &#38; lo comparto\n&#60;b&#62;gracias&#60;/b&#62;')
    expect(email.html).not.toContain('<script>')
    expect(email.html).toContain('href="https://whemotion.com/post/1/tapestry/#comment-5"')
    expect(email.html).toContain('href="https://whemotion.com/admin/comentarios/"')
  })
})
