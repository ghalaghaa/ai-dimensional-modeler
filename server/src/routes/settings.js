import { Router } from 'express'
import { getSetting, setSetting } from '../db.js'
import { isAiConfigured } from '../config.js'

const router = Router()

const DEFAULTS = {
  my_name: '',
  default_delay_min: '20',
  default_delay_max: '60',
}

router.get('/', (req, res) => {
  const settings = {}
  for (const key of Object.keys(DEFAULTS)) settings[key] = getSetting(key, DEFAULTS[key])
  res.json({ settings, aiConfigured: isAiConfigured() })
})

router.put('/', (req, res) => {
  for (const key of Object.keys(DEFAULTS)) {
    if (req.body?.[key] !== undefined) setSetting(key, String(req.body[key]))
  }
  const settings = {}
  for (const key of Object.keys(DEFAULTS)) settings[key] = getSetting(key, DEFAULTS[key])
  res.json({ settings })
})

export default router
