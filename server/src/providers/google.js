import { google } from 'googleapis'
import { config } from '../config.js'
import { db } from '../db.js'
import { decryptToken, encryptToken } from '../crypto.js'
import { buildRawMimeMessage } from '../utils/mime.js'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid',
]

export function createGoogleOAuthClient() {
  return new google.auth.OAuth2(config.google.clientId, config.google.clientSecret, config.google.redirectUri)
}

export function getGoogleAuthUrl(state) {
  const client = createGoogleOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  })
}

export async function handleGoogleCallback(code) {
  const client = createGoogleOAuthClient()
  const { tokens } = await client.getToken(code)
  client.setCredentials(tokens)

  const oauth2 = google.oauth2({ auth: client, version: 'v2' })
  const { data: profile } = await oauth2.userinfo.get()

  return {
    provider: 'google',
    email: profile.email,
    displayName: profile.name || profile.email,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date,
  }
}

// Returns an authenticated OAuth2 client for the account, refreshing (and
// persisting) the access token when needed.
async function getAuthedClientForAccount(account) {
  const client = createGoogleOAuthClient()
  client.setCredentials({
    access_token: decryptToken(account.access_token_enc),
    refresh_token: decryptToken(account.refresh_token_enc),
    expiry_date: account.expiry_date,
  })

  client.on('tokens', (tokens) => {
    const updates = []
    const params = []
    if (tokens.access_token) {
      updates.push('access_token_enc = ?')
      params.push(encryptToken(tokens.access_token))
    }
    if (tokens.refresh_token) {
      updates.push('refresh_token_enc = ?')
      params.push(encryptToken(tokens.refresh_token))
    }
    if (tokens.expiry_date) {
      updates.push('expiry_date = ?')
      params.push(tokens.expiry_date)
    }
    if (updates.length) {
      params.push(account.id)
      db.prepare(`UPDATE accounts SET ${updates.join(', ')} WHERE id = ?`).run(...params)
    }
  })

  return client
}

export async function sendGmailMessage(account, { subject, html, to, attachments }) {
  const client = await getAuthedClientForAccount(account)
  const gmail = google.gmail({ version: 'v1', auth: client })

  const raw = await buildRawMimeMessage({
    from: `"${account.display_name || account.email}" <${account.email}>`,
    to,
    subject,
    html,
    attachments,
  })

  const { data } = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } })
  return { messageId: data.id }
}
