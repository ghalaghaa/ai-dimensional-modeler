import MailComposer from 'nodemailer/lib/mail-composer/index.js'

// Builds a base64url-encoded RFC 2822 MIME message, as required by the
// Gmail API's `users.messages.send` (raw field).
export function buildRawMimeMessage({ from, to, subject, html, attachments }) {
  const mail = new MailComposer({
    from,
    to,
    subject,
    html,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      path: a.path,
      contentType: a.contentType,
    })),
  })

  return new Promise((resolve, reject) => {
    mail.compile().build((err, message) => {
      if (err) return reject(err)
      const raw = message.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      resolve(raw)
    })
  })
}
