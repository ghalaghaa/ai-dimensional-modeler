import express from 'express'
import cors from 'cors'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Server } from 'socket.io'
import { config } from './config.js'
import './db.js'
import { setIo } from './sockets.js'
import { initScheduler } from './queue/campaignEngine.js'

import authRoutes from './routes/auth.js'
import accountsRoutes from './routes/accounts.js'
import recipientsRoutes from './routes/recipients.js'
import listsRoutes from './routes/lists.js'
import templatesRoutes from './routes/templates.js'
import attachmentsRoutes from './routes/attachments.js'
import settingsRoutes from './routes/settings.js'
import aiRoutes from './routes/ai.js'
import campaignsRoutes from './routes/campaigns.js'

const app = express()
app.use(cors({ origin: config.clientUrl }))
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/accounts', accountsRoutes)
app.use('/api/recipients', recipientsRoutes)
app.use('/api/lists', listsRoutes)
app.use('/api/templates', templatesRoutes)
app.use('/api/attachments', attachmentsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/campaigns', campaignsRoutes)

// Single-service deployment: the frontend's production build (Vite outputs to
// ../dist relative to the repo root) is served by this same process, so the
// whole app lives behind one URL with no separate static host needed.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDist = path.join(__dirname, '..', '..', 'dist')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')))
}

app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: config.clientUrl } })
setIo(io)

io.on('connection', (socket) => {
  socket.on('join', (campaignId) => socket.join(`campaign:${campaignId}`))
  socket.on('leave', (campaignId) => socket.leave(`campaign:${campaignId}`))
})

initScheduler()

server.listen(config.port, () => {
  console.log(`Job emailer API listening on http://localhost:${config.port}`)
})
