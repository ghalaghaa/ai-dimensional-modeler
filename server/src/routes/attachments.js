import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v4 as uuid } from 'uuid'
import { db } from '../db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const uploadsDir = path.join(__dirname, '..', '..', 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } })

const router = Router()

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM attachments ORDER BY created_at DESC').all())
})

router.post('/', upload.array('files', 5), (req, res) => {
  const files = req.files || []
  const insert = db.prepare(
    'INSERT INTO attachments (id, original_name, stored_name, mime_type, size) VALUES (?, ?, ?, ?, ?)'
  )
  const created = files.map((f) => {
    const id = uuid()
    insert.run(id, f.originalname, f.filename, f.mimetype, f.size)
    return db.prepare('SELECT * FROM attachments WHERE id = ?').get(id)
  })
  res.status(201).json(created)
})

router.delete('/:id', (req, res) => {
  const attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id)
  if (attachment) {
    fs.unlink(path.join(uploadsDir, attachment.stored_name), () => {})
    db.prepare('DELETE FROM attachments WHERE id = ?').run(req.params.id)
  }
  res.json({ ok: true })
})

export default router
