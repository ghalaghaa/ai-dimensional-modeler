import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { db } from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  const lists = db
    .prepare(
      `SELECT l.id, l.name, l.created_at, COUNT(r.id) AS recipient_count
       FROM recipient_lists l LEFT JOIN recipients r ON r.list_id = l.id
       GROUP BY l.id ORDER BY l.created_at DESC`
    )
    .all()
  res.json(lists)
})

// Saves the current working-set recipients as a named, reusable snapshot.
router.post('/', (req, res) => {
  const { name } = req.body || {}
  if (!name?.trim()) return res.status(400).json({ error: 'A list name is required.' })

  const current = db.prepare('SELECT * FROM recipients WHERE list_id IS NULL').all()
  if (!current.length) return res.status(400).json({ error: 'No recipients to save.' })

  const listId = uuid()
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO recipient_lists (id, name) VALUES (?, ?)').run(listId, name.trim())
    const insert = db.prepare(
      'INSERT INTO recipients (id, list_id, company_name, recruiter_name, job_title, email) VALUES (?, ?, ?, ?, ?, ?)'
    )
    for (const r of current) {
      insert.run(uuid(), listId, r.company_name, r.recruiter_name, r.job_title, r.email)
    }
  })
  tx()
  res.status(201).json({ id: listId, name: name.trim(), recipient_count: current.length })
})

// Loads a saved list into the current working set (merging, skipping duplicate emails).
router.post('/:id/load', (req, res) => {
  const items = db.prepare('SELECT * FROM recipients WHERE list_id = ?').all(req.params.id)
  const existing = new Set(
    db.prepare('SELECT email FROM recipients WHERE list_id IS NULL').all().map((r) => r.email)
  )
  let added = 0
  const insert = db.prepare(
    'INSERT INTO recipients (id, list_id, company_name, recruiter_name, job_title, email) VALUES (?, NULL, ?, ?, ?, ?)'
  )
  const tx = db.transaction(() => {
    for (const item of items) {
      if (existing.has(item.email)) continue
      insert.run(uuid(), item.company_name, item.recruiter_name, item.job_title, item.email)
      existing.add(item.email)
      added += 1
    }
  })
  tx()
  res.json({ added, skippedDuplicates: items.length - added })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM recipient_lists WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
