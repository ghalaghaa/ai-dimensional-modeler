import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { db } from '../db.js'
import {
  computeStats,
  beginCampaign,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  retryFailedCampaign,
  exportCampaignCsv,
} from '../queue/campaignEngine.js'

const router = Router()

function campaignWithStats(campaign) {
  return { ...campaign, stats: computeStats(campaign.id) }
}

router.get('/', (req, res) => {
  const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all()
  res.json(campaigns.map(campaignWithStats))
})

router.get('/:id', (req, res) => {
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id)
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' })
  res.json(campaignWithStats(campaign))
})

router.get('/:id/logs', (req, res) => {
  const logs = db
    .prepare('SELECT * FROM send_logs WHERE campaign_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 500')
    .all(req.params.id)
  res.json(logs)
})

router.get('/:id/export', (req, res) => {
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id)
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' })
  const csv = exportCampaignCsv(req.params.id)
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="${campaign.name.replace(/[^\w.-]/g, '_')}.csv"`)
  res.send(csv)
})

router.post('/', (req, res) => {
  const {
    name,
    subject,
    body_html,
    recipient_ids = [],
    sender_account_id,
    attachment_ids = [],
    delay_min_seconds = 20,
    delay_max_seconds = 60,
    ai_enabled = false,
    scheduled_at = null,
  } = req.body || {}

  if (!subject?.trim() || !body_html?.trim()) {
    return res.status(400).json({ error: 'Subject and body are required.' })
  }
  if (!recipient_ids.length) {
    return res.status(400).json({ error: 'Select at least one recipient.' })
  }
  if (!sender_account_id) {
    return res.status(400).json({ error: 'Choose a sender account.' })
  }
  const account = db.prepare('SELECT id FROM accounts WHERE id = ?').get(sender_account_id)
  if (!account) return res.status(400).json({ error: 'Sender account not found. Reconnect it in Settings.' })

  const placeholders = recipient_ids.map(() => '?').join(',')
  const recipients = db.prepare(`SELECT * FROM recipients WHERE id IN (${placeholders})`).all(...recipient_ids)
  if (!recipients.length) return res.status(400).json({ error: 'Selected recipients could not be found.' })

  // Dedupe by email within this send, and warn (non-blocking) about emails
  // that already received a successful send in a previous campaign.
  const seen = new Set()
  const uniqueRecipients = recipients.filter((r) => {
    if (seen.has(r.email)) return false
    seen.add(r.email)
    return true
  })

  const emailList = [...seen]
  const emailPlaceholders = emailList.map(() => '?').join(',')
  const previouslyEmailed = emailList.length
    ? db
        .prepare(
          `SELECT COUNT(DISTINCT email) AS n FROM campaign_recipients WHERE status = 'sent' AND email IN (${emailPlaceholders})`
        )
        .get(...emailList).n
    : 0

  const campaignId = uuid()
  const status = scheduled_at ? 'scheduled' : 'draft'

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO campaigns (id, name, subject, body_html, sender_account_id, attachment_ids_json, delay_min_seconds, delay_max_seconds, ai_enabled, status, scheduled_at, previously_emailed_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      campaignId,
      name?.trim() || `Job Applications — ${new Date().toISOString().slice(0, 10)}`,
      subject,
      body_html,
      sender_account_id,
      JSON.stringify(attachment_ids),
      Math.max(0, Number(delay_min_seconds) || 0),
      Math.max(0, Number(delay_max_seconds) || 0),
      ai_enabled ? 1 : 0,
      status,
      scheduled_at,
      previouslyEmailed
    )

    const insertCr = db.prepare(
      `INSERT INTO campaign_recipients (id, campaign_id, recipient_id, company_name, recruiter_name, job_title, email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    for (const r of uniqueRecipients) {
      insertCr.run(uuid(), campaignId, r.id, r.company_name, r.recruiter_name, r.job_title, r.email)
    }
  })
  tx()

  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId)

  if (!scheduled_at) beginCampaign(campaignId)

  res.status(201).json({
    ...campaignWithStats(campaign),
    warnings: {
      duplicatesSkipped: recipients.length - uniqueRecipients.length,
      previouslyEmailed,
    },
  })
})

router.post('/:id/pause', (req, res) => {
  pauseCampaign(req.params.id)
  res.json(campaignWithStats(db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id)))
})

router.post('/:id/resume', (req, res) => {
  resumeCampaign(req.params.id)
  res.json(campaignWithStats(db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id)))
})

router.post('/:id/cancel', (req, res) => {
  cancelCampaign(req.params.id)
  res.json(campaignWithStats(db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id)))
})

router.post('/:id/retry-failed', (req, res) => {
  retryFailedCampaign(req.params.id)
  res.json(campaignWithStats(db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id)))
})

export default router
