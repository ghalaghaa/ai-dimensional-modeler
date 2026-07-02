import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Trash2, Plus, ShieldCheck, Info, Sparkles } from 'lucide-react'
import { Topbar } from '../components/layout/Topbar'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Field'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function SettingsPage() {
  const [accounts, setAccounts] = useState([])
  const [providers, setProviders] = useState({ google: false, microsoft: false })
  const [settings, setSettings] = useState({ my_name: '', default_delay_min: '20', default_delay_max: '60' })
  const [aiConfigured, setAiConfigured] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingRemove, setPendingRemove] = useState(null)
  const [params] = useSearchParams()
  const toast = useToast()

  const refreshAccounts = () => api.get('/accounts').then((res) => { setAccounts(res.accounts); setProviders(res.providers) })

  useEffect(() => {
    refreshAccounts()
    api.get('/settings').then((res) => { setSettings(res.settings); setAiConfigured(res.aiConfigured) })
  }, [])

  useEffect(() => {
    const connected = params.get('connected')
    const error = params.get('error')
    if (connected) {
      toast.success(`${connected === 'google' ? 'Gmail' : 'Outlook'} account connected.`)
      refreshAccounts()
    }
    if (error) toast.error(decodeURIComponent(error))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await api.put('/settings', settings)
      setSettings(res.settings)
      toast.success('Settings saved.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const disconnect = async (id) => {
    await api.delete(`/accounts/${id}`)
    toast.success('Account disconnected.')
    refreshAccounts()
  }

  return (
    <div>
      <Topbar title="Settings" subtitle="Connected accounts, sender identity, and defaults" />
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Card>
          <CardHeader title="Connected Accounts" description="Sign in with Gmail or Outlook via OAuth — passwords are never requested or stored." />
          <div className="p-5 space-y-4">
            {accounts.length === 0 ? (
              <EmptyState icon={Mail} title="No accounts connected" description="Connect at least one account below to start sending." />
            ) : (
              <div className="space-y-2">
                {accounts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{a.email}</p>
                      <p className="text-xs text-slate-500">{a.display_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="brand">{a.provider === 'google' ? 'Gmail' : 'Outlook'}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => setPendingRemove(a)}>
                        <Trash2 size={14} className="text-rose-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="secondary" onClick={() => (window.location.href = '/api/auth/google/start')} disabled={!providers.google}>
                <Plus size={14} /> Connect Gmail
              </Button>
              <Button variant="secondary" onClick={() => (window.location.href = '/api/auth/microsoft/start')} disabled={!providers.microsoft}>
                <Plus size={14} /> Connect Outlook
              </Button>
            </div>
            {(!providers.google || !providers.microsoft) && (
              <p className="text-xs text-slate-500 flex items-start gap-1.5">
                <Info size={13} className="mt-0.5 shrink-0" />
                {!providers.google && !providers.microsoft
                  ? 'No OAuth providers are configured on the server yet.'
                  : `${!providers.google ? 'Gmail' : 'Outlook'} isn't configured on the server yet.`}{' '}
                Set the corresponding credentials in <code>server/.env</code> (see server/.env.example) and restart the API.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Sender Identity & Defaults" description="Used to fill the {{my_name}} placeholder and pre-fill new campaigns." />
          <div className="p-5 space-y-4">
            <div>
              <Label>Your Name</Label>
              <Input value={settings.my_name} onChange={(e) => setSettings((s) => ({ ...s, my_name: e.target.value }))} placeholder="Jane Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Default min delay (seconds)</Label>
                <Input type="number" min={0} value={settings.default_delay_min} onChange={(e) => setSettings((s) => ({ ...s, default_delay_min: e.target.value }))} />
              </div>
              <div>
                <Label>Default max delay (seconds)</Label>
                <Input type="number" min={0} value={settings.default_delay_max} onChange={(e) => setSettings((s) => ({ ...s, default_delay_max: e.target.value }))} />
              </div>
            </div>
            <Button onClick={saveSettings} loading={saving}>
              Save Settings
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="AI Personalization" />
          <div className="p-5 flex items-start gap-3">
            <Sparkles size={18} className={aiConfigured ? 'text-brand-500' : 'text-slate-400'} />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {aiConfigured
                ? 'GROQ_API_KEY is configured — AI personalization is available in Compose.'
                : 'Not configured. Set GROQ_API_KEY in server/.env to enable AI-generated, per-recipient opening lines.'}
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Security" />
          <div className="p-5 flex items-start gap-3">
            <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sign-in uses OAuth 2.0 only. Your email password is never requested or stored. Access/refresh tokens are encrypted at rest
              (AES-256-GCM) using the server's <code>TOKEN_ENCRYPTION_KEY</code>.
            </p>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={!!pendingRemove}
        onClose={() => setPendingRemove(null)}
        onConfirm={() => disconnect(pendingRemove.id)}
        title="Disconnect account?"
        description={`${pendingRemove?.email} will no longer be usable as a sender until reconnected.`}
        confirmLabel="Disconnect"
      />
    </div>
  )
}
