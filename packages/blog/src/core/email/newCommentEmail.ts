import { escapeHtml } from './send'

interface NewCommentEmail {
  author: string
  text: string
  postTitle: string
  commentUrl: string
  panelUrl: string
}

/** The notice of a new comment: who, on which post, what they said, and where to delete it. */
export function newCommentEmail({ author, text, postTitle, commentUrl, panelUrl }: NewCommentEmail) {
  const subject = `Emoción Blanca: nuevo comentario de ${author} en «${postTitle}»`
  const plain = [
    `${author} ha comentado en «${postTitle}»:`,
    '',
    text,
    '',
    `Verlo en la web: ${commentUrl}`,
    `Si hay que borrarlo, desde el panel: ${panelUrl}`,
  ].join('\n')
  const button = (href: string, label: string, color: string) =>
    `<a href="${escapeHtml(href)}" style="display: inline-block; margin: 0 12px 12px 0; background: ${color}; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-family: Arial, sans-serif; font-size: 16px">${label}</a>`
  const html = `<div style="font-family: Georgia, serif; font-size: 18px; line-height: 1.5; color: #212529; max-width: 560px">
  <p><b>${escapeHtml(author)}</b> ha comentado en «${escapeHtml(postTitle)}»:</p>
  <blockquote style="margin: 24px 0; padding: 12px 16px; border-left: 4px solid #dd6b20; background: #f7f7f7; white-space: pre-wrap">${escapeHtml(text)}</blockquote>
  <p>${button(commentUrl, 'Verlo en la web', '#dd6b20')}${button(panelUrl, 'Ir a los comentarios del panel', '#495057')}</p>
</div>`
  return { subject, text: plain, html }
}
