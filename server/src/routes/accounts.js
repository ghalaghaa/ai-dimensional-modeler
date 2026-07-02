import { Router } from 'express'
import { db } from '../db.js'
import { isGoogleConfigured, isMicrosoftConfigured } from '../config.js'

const router = Router()

router.get('/', (req, res) => {
  const accounts = db
    .prepare('SELECT id, provider, email, display_name, created_at FROM accounts ORDER BY created_at DESC')
    .all()
  res.json({
    accounts,
    providers: { google: isGoogleConfigured(), microsoft: isMicrosoftConfigured() },
  })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM accounts WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
