import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail, Send, CheckCircle2, XCircle, Clock, Pause, Play, Ban, RotateCcw, Download, Info, PartyPopper } from 'lucide-react'
import { Topbar } from '../components/layout/Topbar'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label, Select } from '../components/ui/Field'
import { StatCard } from '../components/ui/StatCard'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Badge } from '../components/ui/Badge'
import { LogsTable } from '../components/LogsTable'
import { EmptyState } from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'
import { useRecipients } from '../context/RecipientsContext'
import { useDraft } from '../context/DraftContext'
import { useSocket } from '../context/SocketContext'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

const STATUS_TONE = {
  draft: 'slate',
  scheduled: 'amber',
  running: 'brand',
  paused: 'amber',
  completed: 'emerald',
  cancelled: 'rose',
}

function SetupPanel() {
  const { selectedIds } = useRecipients()
  const { draft, setDraft } = useDraft()
  const [accounts, setAccounts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const selectedCount = selectedIds.size

  useEffect(() => {
    api.get('/accounts').then((res) => {
      setAccounts(res.accounts)
      if (res.accounts.length && !draft.senderAccountId) setDraft({ senderAccountId: res.accounts[0].id })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async () => {
    if (!selectedCount) return toast.error('Select recipients first.')
    if (!draft.senderAccountId) return toast.error('Connect and choose a sender account in Settings.')
    setSubmitting(true)
    try {
      const campaign = await api.post('/campaigns', {
        name: draft.campaignName,
        subject: draft.subject,
        body_html: draft.bodyHtml,
        recipient_ids: [...selectedIds],
        sender_account_id: draft.senderAccountId,
        attachment_ids: draft.attachmentIds,
        delay_min_seconds: Number(draft.delayMin),
        delay_max_seconds: Number(draft.delayMax),
        ai_enabled: draft.aiEnabled,
        scheduled_at: scheduleEnabled && draft.scheduledAt ? draft.scheduledAt : null,
      })
      if (campaign.warnings?.previouslyEmailed > 0) {
        toast.info(`Heads up: ${campaign.warnings.previouslyEmailed} of these recipients already received an email from a previous campaign.`)
      }
      toast.success(scheduleEnabled ? 'Campaign scheduled.' : 'Sending started.')
      navigate(`/send/${campaign.id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!selectedCount) {
    return (
      <Card>
        <EmptyState
          icon={Mail}
          title="No recipients selected"
          description="Go to the Recipients page and select who should receive this campaign, then come back here."
          action={
            <Link to="/">
              <Button>Select Recipients</Button>
            </Link>
          }
        />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Ready to send" description={`${selectedCount} recipient${selectedCount === 1 ? '' : 's'} will each receive a separate, individual email.`} />
      <div className="p-5 space-y-5">
        <div>
          <Label>Campaign name (optional)</Label>
          <Input value={draft.campaignName} onChange={(e) => setDraft({ campaignName: e.target.value })} placeholder={`Job Applications — ${new Date().toISOString().slice(0, 10)}`} />
        </div>

        <div>
          <Label>Send from</Label>
          {accounts.length === 0 ? (
            <div className="text-sm text-amber-600 flex items-center gap-1.5">
              <Info size={14} /> No connected accounts.{' '}
              <Link to="/settings" className="underline">
                Connect Gmail or Outlook
              </Link>
              .
            </div>
          ) : (
            <Select value={draft.senderAccountId} onChange={(e) => setDraft({ senderAccountId: e.target.value })}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.email} ({a.provider === 'google' ? 'Gmail' : 'Outlook'})
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min delay between emails (seconds)</Label>
            <Input type="number" min={0} value={draft.delayMin} onChange={(e) => setDraft({ delayMin: e.target.value })} />
          </div>
          <div>
            <Label>Max delay between emails (seconds)</Label>
            <Input type="number" min={0} value={draft.delayMax} onChange={(e) => setDraft({ delayMax: e.target.value })} />
          </div>
        </div>
        <p className="text-xs text-slate-500 -mt-3">
          A random delay in this range is used between each send to reduce spam-filter risk. Recommended: 20–60 seconds.
        </p>

        <div>
          <label className="flex items-center gap-2 text-sm mb-2">
            <input type="checkbox" checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} className="accent-brand-600" />
            Schedule for later instead of sending now
          </label>
          {scheduleEnabled && (
            <Input type="datetime-local" value={draft.scheduledAt} onChange={(e) => setDraft({ scheduledAt: e.target.value })} />
          )}
        </div>

        <Button size="lg" className="w-full" onClick={submit} loading={submitting} disabled={accounts.length === 0}>
          <Send size={18} /> {scheduleEnabled ? 'Schedule Campaign' : `Send to ${selectedCount} Recipient${selectedCount === 1 ? '' : 's'} Now`}
        </Button>
      </div>
    </Card>
  )
}

function DashboardPanel({ campaignId }) {
  const [campaign, setCampaign] = useState(null)
  const [logs, setLogs] = useState([])
  const [busy, setBusy] = useState(false)
  const socket = useSocket()
  const toast = useToast()
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    api.get(`/campaigns/${campaignId}`).then(setCampaign)
    api.get(`/campaigns/${campaignId}/logs`).then(setLogs)
  }, [campaignId])

  useEffect(() => {
    if (!socket) return
    socket.emit('join', campaignId)
    const onProgress = (stats) => setCampaign((c) => (c ? { ...c, stats } : c))
    const onStatus = ({ status }) => {
      setCampaign((c) => (c ? { ...c, status } : c))
      if (status === 'completed') {
        setCelebrate(true)
        setTimeout(() => setCelebrate(false), 2400)
      }
    }
    const onLog = (log) => setLogs((prev) => [log, ...prev].slice(0, 500))
    socket.on('campaign:progress', onProgress)
    socket.on('campaign:status', onStatus)
    socket.on('campaign:log', onLog)
    return () => {
      socket.emit('leave', campaignId)
      socket.off('campaign:progress', onProgress)
      socket.off('campaign:status', onStatus)
      socket.off('campaign:log', onLog)
    }
  }, [socket, campaignId])

  const runAction = async (action) => {
    setBusy(true)
    try {
      const updated = await api.post(`/campaigns/${campaignId}/${action}`, {})
      setCampaign(updated)
      toast.success(`Campaign ${action === 'retry-failed' ? 'retrying failed emails' : action + 'd'}.`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const exportCsv = () => window.open(`/api/campaigns/${campaignId}/export`, '_blank')

  if (!campaign) return <Card><CardSkeleton /></Card>

  const s = campaign.stats
  const status = campaign.status

  return (
    <div className="space-y-5 relative">
      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-brand-gradient text-white px-4 py-2 shadow-glow-lg text-sm font-medium"
          >
            <PartyPopper size={16} /> Campaign complete — {s.sent} sent, {s.failed} failed
          </motion.div>
        )}
      </AnimatePresence>
      <Card>
        <CardHeader
          title={campaign.name}
          description={
            <span className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[status]}>{status}</Badge>
              {campaign.previously_emailed_count > 0 && (
                <span className="text-xs text-amber-600">{campaign.previously_emailed_count} previously emailed</span>
              )}
            </span>
          }
          actions={
            <div className="flex gap-2">
              {status === 'running' && (
                <Button size="sm" variant="secondary" onClick={() => runAction('pause')} loading={busy}>
                  <Pause size={14} /> Pause
                </Button>
              )}
              {status === 'paused' && (
                <Button size="sm" onClick={() => runAction('resume')} loading={busy}>
                  <Play size={14} /> Resume
                </Button>
              )}
              {(status === 'running' || status === 'paused') && (
                <Button size="sm" variant="danger" onClick={() => runAction('cancel')} loading={busy}>
                  <Ban size={14} /> Cancel
                </Button>
              )}
              {s.failed > 0 && status !== 'running' && (
                <Button size="sm" variant="secondary" onClick={() => runAction('retry-failed')} loading={busy}>
                  <RotateCcw size={14} /> Retry Failed
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={exportCsv}>
                <Download size={14} /> Export
              </Button>
            </div>
          }
        />
        <div className="p-5 space-y-5">
          <ProgressBar value={s.progress} animated={status === 'running'} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard label="Total" value={s.total} icon={Mail} tone="slate" />
            <StatCard label="Sent" value={s.sent} icon={CheckCircle2} tone="emerald" />
            <StatCard label="Failed" value={s.failed} icon={XCircle} tone="rose" />
            <StatCard label="Remaining" value={s.remaining} icon={Clock} tone="amber" />
            <StatCard label="Progress" value={`${s.progress}%`} icon={Send} tone="brand" />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Sending Log" description="Live timestamped activity, including any errors." />
        <LogsTable logs={logs} />
      </Card>
    </div>
  )
}

export function SendPage() {
  const { campaignId } = useParams()

  return (
    <div>
      <Topbar title="Send" subtitle={campaignId ? 'Live sending progress' : 'Configure and launch your campaign'} />
      <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fade-in">
        {campaignId ? <DashboardPanel campaignId={campaignId} /> : <SetupPanel />}
      </div>
    </div>
  )
}
