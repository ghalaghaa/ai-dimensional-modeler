import path from 'node:path'
import { db } from '../db.js'
import { emitToCampaign } from '../sockets.js'
import { renderTemplate } from '../utils/placeholders.js'
import { sendGmailMessage } from '../providers/google.js'
import { sendMicrosoftMessage } from '../providers/microsoft.js'
import { uploadsDir } from '../routes/attachments.js'
import { generatePersonalization } from '../routes/ai.js'
import { getSetting } from '../db.js'

const activeTimers = new Map() // campaignId -> Timeout
const activeLoops = new Set() // campaignId currently looping

function randomDelayMs(minSec, maxSec) {
  const min = Math.max(0, Number(minSec) || 0)
  const max = Math.max(min, Number(maxSec) || min)
  const seconds = min + Math.random() * (max - min)
  return Math.round(seconds * 1000)
}

export function computeStats(campaignId) {
  const rows = db
    .prepare('SELECT status, COUNT(*) AS n FROM campaign_recipients WHERE campaign_id = ? GROUP BY status')
    .all(campaignId)
  const counts = { pending: 0, sending: 0, sent: 0, failed: 0 }
  for (const r of rows) counts[r.status] = r.n
  const total = counts.pending + counts.sending + counts.sent + counts.failed
  const done = counts.sent + counts.failed
  const progress = total ? Math.round((done / total) * 100) : 0
  return { total, ...counts, remaining: counts.pending + counts.sending, progress }
}

function addLog(campaignId, email, level, message) {
  db.prepare('INSERT INTO send_logs (id, campaign_id, email, level, message) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?)').run(
    campaignId,
    email,
    level,
    message
  )
  const log = db
    .prepare('SELECT * FROM send_logs WHERE campaign_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1')
    .get(campaignId)
  emitToCampaign(campaignId, 'campaign:log', log)
}

function emitProgress(campaignId) {
  const stats = computeStats(campaignId)
  emitToCampaign(campaignId, 'campaign:progress', stats)
  return stats
}

function setCampaignStatus(campaignId, status, extra = {}) {
  const fields = ['status = ?']
  const params = [status]
  if (extra.started_at !== undefined) {
    fields.push('started_at = ?')
    params.push(extra.started_at)
  }
  if (extra.completed_at !== undefined) {
    fields.push('completed_at = ?')
    params.push(extra.completed_at)
  }
  params.push(campaignId)
  db.prepare(`UPDATE campaigns SET ${fields.join(', ')} WHERE id = ?`).run(...params)
  emitToCampaign(campaignId, 'campaign:status', { status })
}

function resolveAttachments(campaign) {
  const ids = JSON.parse(campaign.attachment_ids_json || '[]')
  if (!ids.length) return []
  const placeholders = ids.map(() => '?').join(',')
  const rows = db.prepare(`SELECT * FROM attachments WHERE id IN (${placeholders})`).all(...ids)
  return rows.map((a) => ({
    filename: a.original_name,
    path: path.join(uploadsDir, a.stored_name),
    contentType: a.mime_type,
  }))
}

async function sendOne(campaign, account, recipient, attachments, myName) {
  let aiText = ''
  if (campaign.ai_enabled && /{{\s*ai_personalization\s*}}/.test(campaign.body_html)) {
    try {
      aiText = await generatePersonalization(recipient)
    } catch (err) {
      addLog(campaign.id, recipient.email, 'info', `AI personalization skipped: ${err.message}`)
    }
  }

  const data = {
    company_name: recipient.company_name,
    recruiter_name: recipient.recruiter_name,
    job_title: recipient.job_title,
    my_name: myName,
    ai_personalization: aiText,
  }
  const subject = renderTemplate(campaign.subject, data)
  const html = renderTemplate(campaign.body_html, data)

  if (account.provider === 'google') {
    return sendGmailMessage(account, { subject, html, to: recipient.email, attachments })
  }
  return sendMicrosoftMessage(account, { subject, html, to: recipient.email, attachments })
}

async function runLoop(campaignId) {
  if (activeLoops.has(campaignId)) return
  activeLoops.add(campaignId)

  try {
    while (true) {
      const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId)
      if (!campaign || campaign.status !== 'running') break

      const recipient = db
        .prepare("SELECT * FROM campaign_recipients WHERE campaign_id = ? AND status = 'pending' ORDER BY rowid LIMIT 1")
        .get(campaignId)

      if (!recipient) {
        setCampaignStatus(campaignId, 'completed', { completed_at: new Date().toISOString() })
        emitProgress(campaignId)
        break
      }

      const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(campaign.sender_account_id)
      if (!account) {
        db.prepare("UPDATE campaign_recipients SET status = 'failed', last_error = ? WHERE id = ?").run(
          'No sender account configured for this campaign.',
          recipient.id
        )
        addLog(campaignId, recipient.email, 'error', 'No sender account configured for this campaign.')
        setCampaignStatus(campaignId, 'paused')
        emitProgress(campaignId)
        break
      }

      db.prepare("UPDATE campaign_recipients SET status = 'sending' WHERE id = ?").run(recipient.id)
      emitProgress(campaignId)

      const attachments = resolveAttachments(campaign)
      const myName = getSetting('my_name', '')

      try {
        const result = await sendOne(campaign, account, recipient, attachments, myName)
        db.prepare(
          "UPDATE campaign_recipients SET status = 'sent', attempts = attempts + 1, message_id = ?, sent_at = datetime('now'), last_error = NULL WHERE id = ?"
        ).run(result.messageId || null, recipient.id)
        addLog(campaignId, recipient.email, 'success', `Sent to ${recipient.email}`)
      } catch (err) {
        db.prepare(
          "UPDATE campaign_recipients SET status = 'failed', attempts = attempts + 1, last_error = ? WHERE id = ?"
        ).run(err.message?.slice(0, 500) || 'Unknown error', recipient.id)
        addLog(campaignId, recipient.email, 'error', `Failed to send to ${recipient.email}: ${err.message}`)
      }

      emitProgress(campaignId)

      const stillHasWork = db
        .prepare("SELECT 1 FROM campaign_recipients WHERE campaign_id = ? AND status = 'pending' LIMIT 1")
        .get(campaignId)
      if (!stillHasWork) continue // loop again immediately to hit the completion branch

      const delay = randomDelayMs(campaign.delay_min_seconds, campaign.delay_max_seconds)
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, delay)
        // `wake` lets pause/cancel resolve this promise immediately instead of
        // leaving the loop stuck awaiting a timer that was just cleared.
        activeTimers.set(campaignId, { timer, wake: resolve })
      })
      activeTimers.delete(campaignId)
    }
  } finally {
    activeLoops.delete(campaignId)
  }
}

export function beginCampaign(campaignId) {
  setCampaignStatus(campaignId, 'running', { started_at: new Date().toISOString() })
  runLoop(campaignId).catch((err) => console.error(`Campaign ${campaignId} loop crashed:`, err))
}

function wakeSleepingLoop(campaignId) {
  const pending = activeTimers.get(campaignId)
  if (pending) {
    clearTimeout(pending.timer)
    activeTimers.delete(campaignId)
    pending.wake() // unblocks the loop's `await` so it re-checks status and exits promptly
  }
}

export function pauseCampaign(campaignId) {
  setCampaignStatus(campaignId, 'paused')
  wakeSleepingLoop(campaignId)
}

export function resumeCampaign(campaignId) {
  beginCampaign(campaignId)
}

export function cancelCampaign(campaignId) {
  setCampaignStatus(campaignId, 'cancelled', { completed_at: new Date().toISOString() })
  wakeSleepingLoop(campaignId)
}

export function retryFailedCampaign(campaignId) {
  db.prepare("UPDATE campaign_recipients SET status = 'pending', last_error = NULL WHERE campaign_id = ? AND status = 'failed'").run(
    campaignId
  )
  emitProgress(campaignId)
  beginCampaign(campaignId)
}

export function exportCampaignCsv(campaignId) {
  const rows = db
    .prepare('SELECT email, company_name, recruiter_name, job_title, status, attempts, last_error, sent_at FROM campaign_recipients WHERE campaign_id = ? ORDER BY rowid')
    .all(campaignId)
  const header = ['email', 'company_name', 'recruiter_name', 'job_title', 'status', 'attempts', 'last_error', 'sent_at']
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [header.join(','), ...rows.map((r) => header.map((h) => escape(r[h])).join(','))]
  return lines.join('\n')
}

// Polls for scheduled campaigns whose time has arrived.
export function initScheduler() {
  setInterval(() => {
    const due = db
      .prepare("SELECT id FROM campaigns WHERE status = 'scheduled' AND scheduled_at <= datetime('now')")
      .all()
    for (const { id } of due) beginCampaign(id)
  }, 15_000)
}
