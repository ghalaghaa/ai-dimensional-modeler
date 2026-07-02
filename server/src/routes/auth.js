import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { config, isGoogleConfigured, isMicrosoftConfigured } from '../config.js'
import { db } from '../db.js'
import { encryptToken } from '../crypto.js'
import { getGoogleAuthUrl, handleGoogleCallback } from '../providers/google.js'
import { getMicrosoftAuthUrl, handleMicrosoftCallback } from '../providers/microsoft.js'

const router = Router()

function upsertAccount(result) {
  const existing = db
    .prepare('SELECT id FROM accounts WHERE provider = ? AND email = ?')
    .get(result.provider, result.email)

  const id = existing?.id || uuid()
  db.prepare(
    `INSERT INTO accounts (id, provider, email, display_name, access_token_enc, refresh_token_enc, expiry_date)
     VALUES (@id, @provider, @email, @displayName, @accessToken, @refreshToken, @expiryDate)
     ON CONFLICT(provider, email) DO UPDATE SET
       display_name = excluded.display_name,
       access_token_enc = excluded.access_token_enc,
       refresh_token_enc = COALESCE(excluded.refresh_token_enc, accounts.refresh_token_enc),
       expiry_date = excluded.expiry_date`
  ).run({
    id,
    provider: result.provider,
    email: result.email,
    displayName: result.displayName,
    accessToken: encryptToken(result.accessToken),
    refreshToken: result.refreshToken ? encryptToken(result.refreshToken) : null,
    expiryDate: result.expiryDate || null,
  })
  return id
}

router.get('/google/start', (req, res) => {
  if (!isGoogleConfigured()) {
    return res.status(500).send('Google OAuth is not configured on the server. Set GOOGLE_CLIENT_ID/SECRET in server/.env')
  }
  res.redirect(getGoogleAuthUrl('google'))
})

router.get('/google/callback', async (req, res) => {
  try {
    const result = await handleGoogleCallback(req.query.code)
    upsertAccount(result)
    res.redirect(`${config.clientUrl}/settings?connected=google`)
  } catch (err) {
    console.error('Google OAuth callback failed:', err)
    res.redirect(`${config.clientUrl}/settings?error=${encodeURIComponent(err.message)}`)
  }
})

router.get('/microsoft/start', (req, res) => {
  if (!isMicrosoftConfigured()) {
    return res.status(500).send('Microsoft OAuth is not configured on the server. Set MICROSOFT_CLIENT_ID/SECRET in server/.env')
  }
  res.redirect(getMicrosoftAuthUrl('microsoft'))
})

router.get('/microsoft/callback', async (req, res) => {
  try {
    const result = await handleMicrosoftCallback(req.query.code)
    upsertAccount(result)
    res.redirect(`${config.clientUrl}/settings?connected=microsoft`)
  } catch (err) {
    console.error('Microsoft OAuth callback failed:', err)
    res.redirect(`${config.clientUrl}/settings?error=${encodeURIComponent(err.message)}`)
  }
})

export default router
