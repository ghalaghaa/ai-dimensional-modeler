import { useEffect, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input, Label } from './ui/Field'
import { EmptyState } from './ui/EmptyState'
import { List } from 'lucide-react'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function ListsModal({ open, onClose, onLoaded, hasCurrentRecipients }) {
  const [lists, setLists] = useState([])
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingId, setLoadingId] = useState(null)
  const toast = useToast()

  const refresh = () => api.get('/lists').then(setLists)

  useEffect(() => {
    if (open) refresh()
  }, [open])

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await api.post('/lists', { name })
      toast.success('Recipient list saved.')
      setName('')
      refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const load = async (id) => {
    setLoadingId(id)
    try {
      const result = await api.post(`/lists/${id}/load`, {})
      toast.success(`Loaded ${result.added} recipient${result.added === 1 ? '' : 's'}${result.skippedDuplicates ? ` (${result.skippedDuplicates} already present)` : ''}.`)
      onLoaded()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  const remove = async (id) => {
    await api.delete(`/lists/${id}`)
    refresh()
  }

  return (
    <Modal open={open} onClose={onClose} title="Recipient Lists" size="lg">
      <div className="space-y-5">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label>Save current recipients as a list</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Frontend roles — July batch" />
          </div>
          <Button onClick={save} loading={saving} disabled={!name.trim() || !hasCurrentRecipients}>
            Save List
          </Button>
        </div>

        <div>
          <Label>Saved lists</Label>
          {lists.length === 0 ? (
            <EmptyState icon={List} title="No saved lists yet" description="Save your current recipient set above to reuse it later." />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lists.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-slate-500">{l.recipient_count} recipients</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="secondary" onClick={() => load(l.id)} loading={loadingId === l.id}>
                      <Upload size={14} /> Load
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(l.id)}>
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
