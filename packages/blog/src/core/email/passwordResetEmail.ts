import { escapeHtml } from './send'

export function passwordResetEmail({ name, link }: { name: string; link: string }) {
  const subject = 'Emoción Blanca: cambia tu contraseña del panel'
  const text = [
    `Hola, ${name}:`,
    '',
    'Alguien ha pedido cambiar la contraseña de tu cuenta del panel de Emoción Blanca.',
    `Para poner una nueva, abre este enlace (sirve una sola vez, durante una hora):`,
    link,
    '',
    'Si no lo has pedido tú, ignora este mensaje: tu contraseña no cambia.',
  ].join('\n')
  const html = `<div style="font-family: Georgia, serif; font-size: 18px; line-height: 1.5; color: #212529; max-width: 560px">
  <p>Hola, ${escapeHtml(name)}:</p>
  <p>Alguien ha pedido cambiar la contraseña de tu cuenta del panel de Emoción Blanca.</p>
  <p style="margin: 32px 0"><a href="${escapeHtml(link)}" style="background: #dd6b20; color: #fff; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-family: Arial, sans-serif">Poner una contraseña nueva</a></p>
  <p>El enlace sirve una sola vez, durante una hora.</p>
  <p>Si no lo has pedido tú, ignora este mensaje: tu contraseña no cambia.</p>
</div>`
  return { subject, text, html }
}
