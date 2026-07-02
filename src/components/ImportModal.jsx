import { useRef, useState } from 'react'
import { UploadCloud, FileSpreadsheet } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function ImportModal({ open, onClose, onImported }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)
  const toast = useToast()

  const submit = async () => {
    if (!file) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await api.post('/recipients/import', formData)
      toast.success(`Imported ${result.added} recipient${result.added === 1 ? '' : 's'} from ${result.totalParsed} rows${result.skippedDuplicates ? ` (${result.skippedDuplicates} skipped)` : ''}.`)
      onImported()
      setFile(null)
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Import Recipients">
      <div className="space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files?.[0]
            if (f) setFile(f)
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
            dragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/5' : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          {file ? (
            <>
              <FileSpreadsheet size={28} className="text-brand-600" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB — click to change</p>
            </>
          ) : (
            <>
              <UploadCloud size={28} className="text-slate-400" />
              <p className="text-sm font-medium">Drop a CSV or Excel (.xlsx) file here</p>
              <p className="text-xs text-slate-500">or click to browse</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <p className="text-xs text-slate-500">
          Expected columns (any order, case-insensitive): <code>email</code>, <code>company_name</code>,{' '}
          <code>recruiter_name</code>, <code>job_title</code>. Only <code>email</code> is required.
        </p>
      </div>
      <div className="flex justify-end gap-2 pt-5">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} loading={saving} disabled={!file}>
          Import
        </Button>
      </div>
    </Modal>
  )
}
