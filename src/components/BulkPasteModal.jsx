import { useMemo, useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Textarea, Input, Label } from './ui/Field'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

export function BulkPasteModal({ open, onClose, onImported }) {
  const [text, setText] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const emailCount = useMemo(() => new Set((text.match(EMAIL_RE) || []).map((e) => e.toLowerCase())).size, [text])

  const submit = async () => {
    if (!emailCount) return toast.error('Paste at least one valid email address.')
    setSaving(true)
    try {
      const result = await api.post('/recipients/bulk-paste', { text, company_name: companyName, job_title: jobTitle })
      toast.success(`Added ${result.added} recipient${result.added === 1 ? '' : 's'}${result.skippedDuplicates ? ` (${result.skippedDuplicates} duplicates skipped)` : ''}.`)
      onImported()
      setText('')
      setCompanyName('')
      setJobTitle('')
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Paste Email Addresses" size="lg">
      <div className="space-y-4">
        <div>
          <Label>Emails (one per line, or comma/space separated)</Label>
          <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={'jane@acme.com\njohn@globex.com, hr@initech.com'} />
          <p className="text-xs text-slate-500 mt-1.5">{emailCount} unique email{emailCount === 1 ? '' : 's'} detected</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Company Name (applied to all, optional)</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Leave blank to edit individually" />
          </div>
          <div>
            <Label>Job Title (applied to all, optional)</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Leave blank to edit individually" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-5">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} loading={saving} disabled={!emailCount}>
          Add {emailCount || ''} Recipient{emailCount === 1 ? '' : 's'}
        </Button>
      </div>
    </Modal>
  )
}
