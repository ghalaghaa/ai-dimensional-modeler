import { useEffect, useState } from 'react'
import { FileText, Trash2, Upload } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input, Label } from './ui/Field'
import { EmptyState } from './ui/EmptyState'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function TemplatesModal({ open, onClose, onLoad, currentSubject, currentBody }) {
  const [templates, setTemplates] = useState([])
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const refresh = () => api.get('/templates').then(setTemplates)
  useEffect(() => {
    if (open) refresh()
  }, [open])

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await api.post('/templates', { name, subject: currentSubject, body_html: currentBody })
      toast.success('Template saved.')
      setName('')
      refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    await api.delete(`/templates/${id}`)
    refresh()
  }

  return (
    <Modal open={open} onClose={onClose} title="Email Templates" size="lg">
      <div className="space-y-5">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label>Save current draft as a template</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard application email" />
          </div>
          <Button onClick={save} loading={saving} disabled={!name.trim() || !currentSubject}>
            Save Template
          </Button>
        </div>

        <div>
          <Label>Saved templates</Label>
          {templates.length === 0 ? (
            <EmptyState icon={FileText} title="No templates yet" description="Save your current subject and body to reuse them for future campaigns." />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-slate-500 truncate">{t.subject}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        onLoad(t)
                        onClose()
                      }}
                    >
                      <Upload size={14} /> Load
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(t.id)}>
                      <Trash2 size={14} className="text-rose-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
