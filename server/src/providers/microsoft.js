import fs from 'node:fs'
import { config } from '../config.js'
import { db } from '../db.js'
import { decryptToken, encryptToken } from '../crypto.js'

const SCOPES = ['openid', 'email', 'offline_access', 'User.Read', 'Mail.Send']
const AUTHORITY = `https://login.microsoftonline.com/${config.microsoft.tenantId}`

export function getMicrosoftAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: config.microsoft.clientId,
    response_type: 'code',
    redirect_uri: config.microsoft.redirectUri,
    response_mode: 'query',
    scope: SCOPES.join(' '),
    state,
  })
  return `${AUTHORITY}/oauth2/v2.0/authorize?${params.toString()}`
}

async function requestToken(body) {
  const res = await fetch(`${AUTHORITY}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.error || 'Microsoft token request failed')
  return data
}

export async function handleMicrosoftCallback(code) {
  const tokens = await requestToken({
    client_id: config.microsoft.clientId,
    client_secret: config.microsoft.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.microsoft.redirectUri,
    scope: SCOPES.join(' '),
  })

  const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const profile = await profileRes.json()
  if (!profileRes.ok) throw new Error(profile.error?.message || 'Failed to fetch Microsoft profile')

  const email = profile.mail || profile.userPrincipalName
  return {
    provider: 'microsoft',
    email,
    displayName: profile.displayName || email,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: Date.now() + tokens.expires_in * 1000,
  }
}

async function getValidAccessToken(account) {
  const stillValid = account.expiry_date && account.expiry_date - 60_000 > Date.now()
  if (stillValid) return decryptToken(account.access_token_enc)

  const refreshToken = decryptToken(account.refresh_token_enc)
  const tokens = await requestToken({
    client_id: config.microsoft.clientId,
    client_secret: config.microsoft.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    scope: SCOPES.join(' '),
  })

  const expiryDate = Date.now() + tokens.expires_in * 1000
  db.prepare(
    'UPDATE accounts SET access_token_enc = ?, refresh_token_enc = ?, expiry_date = ? WHERE id = ?'
  ).run(
    encryptToken(tokens.access_token),
    encryptToken(tokens.refresh_token || refreshToken),
    expiryDate,
    account.id
  )

  return tokens.access_token
}

export async function sendMicrosoftMessage(account, { subject, html, to, attachments }) {
  const accessToken = await getValidAccessToken(account)

  const fileAttachments = (attachments || []).map((a) => ({
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: a.filename,
    contentType: a.contentType,
    contentBytes: fs.readFileSync(a.path).toString('base64'),
  }))

  const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: 'HTML', content: html },
        toRecipients: [{ emailAddress: { address: to } }],
        attachments: fileAttachments,
      },
      saveToSentItems: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Microsoft Graph sendMail failed (${res.status}): ${text}`)
  }
  // Graph's sendMail returns 202 Accepted with no body / message id.
  return { messageId: null }
}
