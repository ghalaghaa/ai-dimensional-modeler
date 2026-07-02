import { useEffect, useRef, useState } from 'react'
import { Paperclip, UploadCloud, Trash2 } from 'lucide-react'
import { Button } from './ui/Button'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function AttachmentUploader({ selectedIds, onChangeSelected }) {
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)
  const toast = useToast()

  const refresh = () => api.get('/attachments').then(setAttachments)
  useEffect(() => {
    refresh()
  }, [])

  const upload = async (files) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      ;[...files].forEach((f) => formData.append('files', f))
      const created = await api.post('/attachments', formData)
      toast.success(`Uploaded ${created.length} file${created.length === 1 ? '' : 's'}.`)
      await refresh()
      onChangeSelected([...selectedIds, ...created.map((c) => c.id)])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const toggle = (id) => {
    onChangeSelected(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])
  }

  const remove = async (id) => {
    await api.delete(`/attachments/${id}`)
    onChangeSelected(selectedIds.filter((x) => x !== id))
    refresh()
  }

  return (
    <div className="space-y-2">
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map((a) => (
            <label
              key={a.id}
              className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm cursor-pointer"
            >
              <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggle(a.id)} className="accent-brand-600" />
              <Paperclip size={14} className="text-slate-400 shrink-0" />
              <span className="flex-1 truncate">{a.original_name}</span>
              <span className="text-xs text-slate-400">{(a.size / 1024).toFixed(0)} KB</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  remove(a.id)
                }}
                className="text-slate-400 hover:text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            </label>
          ))}
        </div>
      )}
      <Button type="button" variant="secondary" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
        <UploadCloud size={14} /> Upload CV / Cover Letter / Portfolio
      </Button>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
    </div>
  )
}
