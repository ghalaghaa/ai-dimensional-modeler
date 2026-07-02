import { useEffect, useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input, Label } from './ui/Field'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

const EMPTY = { company_name: '', recruiter_name: '', job_title: '', email: '' }

export function RecipientFormModal({ open, onClose, recipient, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (open) setForm(recipient ? { ...EMPTY, ...recipient } : EMPTY)
  }, [open, recipient])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const saved = recipient
        ? await api.put(`/recipients/${recipient.id}`, form)
        : await api.post('/recipients', form)
      toast.success(recipient ? 'Recipient updated.' : 'Recipient added.')
      onSaved(saved)
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={recipient ? 'Edit Recipient' : 'Add Recipient'}>
      <form id="recipient-form" onSubmit={submit} className="space-y-4">
        <div>
          <Label>Email Address *</Label>
          <Input type="email" required value={form.email} onChange={set('email')} placeholder="recruiter@company.com" />
        </div>
        <div>
          <Label>Company Name</Label>
          <Input value={form.company_name} onChange={set('company_name')} placeholder="Acme Inc." />
        </div>
        <div>
          <Label>Recruiter Name</Label>
          <Input value={form.recruiter_name} onChange={set('recruiter_name')} placeholder="Jane Smith" />
        </div>
        <div>
          <Label>Job Title</Label>
          <Input value={form.job_title} onChange={set('job_title')} placeholder="Senior Frontend Engineer" />
        </div>
      </form>
      <div className="flex justify-end gap-2 pt-5">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button form="recipient-form" type="submit" loading={saving}>
          Save
        </Button>
      </div>
    </Modal>
  )
}
