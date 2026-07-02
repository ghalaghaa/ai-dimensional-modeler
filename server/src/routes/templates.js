import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { db } from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM templates ORDER BY updated_at DESC').all())
})

router.post('/', (req, res) => {
  const { name, subject = '', body_html = '' } = req.body || {}
  if (!name?.trim()) return res.status(400).json({ error: 'A template name is required.' })
  const id = uuid()
  db.prepare('INSERT INTO templates (id, name, subject, body_html) VALUES (?, ?, ?, ?)').run(
    id,
    name.trim(),
    subject,
    body_html
  )
  res.status(201).json(db.prepare('SELECT * FROM templates WHERE id = ?').get(id))
})

router.put('/:id', (req, res) => {
  const { name, subject = '', body_html = '' } = req.body || {}
  if (!name?.trim()) return res.status(400).json({ error: 'A template name is required.' })
  db.prepare(
    `UPDATE templates SET name = ?, subject = ?, body_html = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(name.trim(), subject, body_html, req.params.id)
  res.json(db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
