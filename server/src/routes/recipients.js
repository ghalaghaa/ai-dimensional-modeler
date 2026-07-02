import { Router } from 'express'
import multer from 'multer'
import { v4 as uuid } from 'uuid'
import { db } from '../db.js'
import { parsePastedEmails, parseSpreadsheet } from '../utils/parseRecipients.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
const router = Router()

// "Working set" recipients live with list_id IS NULL.
const insertStmt = db.prepare(
  `INSERT INTO recipients (id, list_id, company_name, recruiter_name, job_title, email)
   VALUES (?, NULL, ?, ?, ?, ?)`
)

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM recipients WHERE list_id IS NULL ORDER BY created_at DESC')
    .all()
  res.json(rows)
})

router.post('/', (req, res) => {
  const { company_name = '', recruiter_name = '', job_title = '', email } = req.body || {}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' })
  }
  const normalizedEmail = email.trim().toLowerCase()
  const existing = db
    .prepare('SELECT id FROM recipients WHERE list_id IS NULL AND email = ?')
    .get(normalizedEmail)
  if (existing) {
    return res.status(409).json({ error: 'This email address is already in your recipient list.' })
  }
  const id = uuid()
  insertStmt.run(id, company_name, recruiter_name, job_title, normalizedEmail)
  res.status(201).json(db.prepare('SELECT * FROM recipients WHERE id = ?').get(id))
})

router.post('/bulk-paste', (req, res) => {
  const { text, company_name = '', recruiter_name = '', job_title = '' } = req.body || {}
  const emails = parsePastedEmails(text)
  const existing = new Set(
    db.prepare('SELECT email FROM recipients WHERE list_id IS NULL').all().map((r) => r.email)
  )
  const inserted = []
  const tx = db.transaction(() => {
    for (const email of emails) {
      if (existing.has(email)) continue
      const id = uuid()
      insertStmt.run(id, company_name, recruiter_name, job_title, email)
      existing.add(email)
      inserted.push(id)
    }
  })
  tx()
  res.status(201).json({ added: inserted.length, skippedDuplicates: emails.length - inserted.length })
})

router.post('/import', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
  let rows
  try {
    rows = parseSpreadsheet(req.file.buffer)
  } catch (err) {
    return res.status(400).json({ error: `Could not parse file: ${err.message}` })
  }

  const existing = new Set(
    db.prepare('SELECT email FROM recipients WHERE list_id IS NULL').all().map((r) => r.email)
  )
  let added = 0
  const tx = db.transaction(() => {
    for (const row of rows) {
      if (!row.email || existing.has(row.email)) continue
      insertStmt.run(uuid(), row.company_name, row.recruiter_name, row.job_title, row.email)
      existing.add(row.email)
      added += 1
    }
  })
  tx()
  res.status(201).json({ added, skippedDuplicates: rows.length - added, totalParsed: rows.length })
})

router.put('/:id', (req, res) => {
  const { company_name = '', recruiter_name = '', job_title = '', email } = req.body || {}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' })
  }
  const normalizedEmail = email.trim().toLowerCase()
  const conflict = db
    .prepare('SELECT id FROM recipients WHERE list_id IS NULL AND email = ? AND id != ?')
    .get(normalizedEmail, req.params.id)
  if (conflict) {
    return res.status(409).json({ error: 'Another recipient already uses this email address.' })
  }
  db.prepare(
    'UPDATE recipients SET company_name = ?, recruiter_name = ?, job_title = ?, email = ? WHERE id = ?'
  ).run(company_name, recruiter_name, job_title, normalizedEmail, req.params.id)
  res.json(db.prepare('SELECT * FROM recipients WHERE id = ?').get(req.params.id))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM recipients WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

router.post('/delete-bulk', (req, res) => {
  const { ids = [] } = req.body || {}
  if (!ids.length) return res.json({ ok: true, deleted: 0 })
  const placeholders = ids.map(() => '?').join(',')
  const info = db.prepare(`DELETE FROM recipients WHERE list_id IS NULL AND id IN (${placeholders})`).run(...ids)
  res.json({ ok: true, deleted: info.changes })
})

router.post('/clear', (req, res) => {
  db.prepare('DELETE FROM recipients WHERE list_id IS NULL').run()
  res.json({ ok: true })
})

export default router
