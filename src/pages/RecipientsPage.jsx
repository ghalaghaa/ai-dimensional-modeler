import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ClipboardPaste, FileUp, ListChecks, Trash2, Search, ArrowRight, Users } from 'lucide-react'
import { Topbar } from '../components/layout/Topbar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { RecipientTable } from '../components/RecipientTable'
import { RecipientFormModal } from '../components/RecipientFormModal'
import { BulkPasteModal } from '../components/BulkPasteModal'
import { ImportModal } from '../components/ImportModal'
import { ListsModal } from '../components/ListsModal'
import { useRecipients } from '../context/RecipientsContext'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function RecipientsPage() {
  const { recipients, selectedIds, loading, refresh, toggleSelect, clearSelection, setSelectedIds } = useRecipients()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [listsOpen, setListsOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return recipients
    return recipients.filter((r) =>
      [r.email, r.company_name, r.recruiter_name, r.job_title].some((v) => v?.toLowerCase().includes(q))
    )
  }, [recipients, search])

  const allSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((r) => next.delete(r.id))
        return next
      })
    } else {
      setSelectedIds((prev) => new Set([...prev, ...filtered.map((r) => r.id)]))
    }
  }

  const deleteOne = async (id) => {
    await api.delete(`/recipients/${id}`)
    toast.success('Recipient deleted.')
    refresh()
  }

  const deleteSelected = async () => {
    await api.post('/recipients/delete-bulk', { ids: [...selectedIds] })
    toast.success('Selected recipients deleted.')
    clearSelection()
    refresh()
  }

  const clearAll = async () => {
    await api.post('/recipients/clear', {})
    toast.success('All recipients cleared.')
    clearSelection()
    refresh()
  }

  return (
    <div>
      <Topbar title="Recipients" subtitle={`${recipients.length} recipient${recipients.length === 1 ? '' : 's'} in your working list`} />
      <div className="p-4 md:p-8 space-y-5 animate-fade-in">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => { setEditing(null); setFormOpen(true) }}>
            <Plus size={16} /> Add Recipient
          </Button>
          <Button variant="secondary" onClick={() => setPasteOpen(true)}>
            <ClipboardPaste size={16} /> Paste Emails
          </Button>
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            <FileUp size={16} /> Import CSV/Excel
          </Button>
          <Button variant="secondary" onClick={() => setListsOpen(true)}>
            <ListChecks size={16} /> Recipient Lists
          </Button>
          {recipients.length > 0 && (
            <Button variant="ghost" onClick={() => setConfirmClear(true)} className="ml-auto text-rose-600">
              <Trash2 size={16} /> Clear All
            </Button>
          )}
        </div>

        <Card>
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative w-full max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" placeholder="Search recipients…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">{selectedIds.size} selected</span>
                <Button size="sm" variant="ghost" className="text-rose-600" onClick={deleteSelected}>
                  <Trash2 size={14} /> Delete Selected
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={recipients.length === 0 ? 'No recipients yet' : 'No matches'}
              description={
                recipients.length === 0
                  ? 'Add recipients manually, paste a list of emails, or import a CSV/Excel file to get started.'
                  : 'Try a different search term.'
              }
              action={
                recipients.length === 0 && (
                  <Button onClick={() => setPasteOpen(true)}>
                    <ClipboardPaste size={16} /> Paste Emails
                  </Button>
                )
              }
            />
          ) : (
            <RecipientTable
              recipients={filtered}
              selectedIds={selectedIds}
              onToggle={toggleSelect}
              onToggleAll={toggleAll}
              allSelected={allSelected}
              onEdit={(r) => { setEditing(r); setFormOpen(true) }}
              onDelete={deleteOne}
            />
          )}
        </Card>
      </div>

      {selectedIds.size > 0 && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-16 md:bottom-6 right-4 md:right-8 z-20"
        >
          <Button size="lg" onClick={() => navigate('/compose')} className="shadow-xl">
            Continue with {selectedIds.size} recipient{selectedIds.size === 1 ? '' : 's'} <ArrowRight size={18} />
          </Button>
        </motion.div>
      )}

      <RecipientFormModal open={formOpen} onClose={() => setFormOpen(false)} recipient={editing} onSaved={refresh} />
      <BulkPasteModal open={pasteOpen} onClose={() => setPasteOpen(false)} onImported={refresh} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onImported={refresh} />
      <ListsModal open={listsOpen} onClose={() => setListsOpen(false)} onLoaded={refresh} hasCurrentRecipients={recipients.length > 0} />
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearAll}
        title="Clear all recipients?"
        description="This removes every recipient from your current working list. Saved lists are not affected."
        confirmLabel="Clear All"
      />
    </div>
  )
}
