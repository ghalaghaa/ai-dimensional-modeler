import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, FileText, ArrowRight, Info } from 'lucide-react'
import { Topbar } from '../components/layout/Topbar'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label, Select, Switch } from '../components/ui/Field'
import { RichTextEditor } from '../components/RichTextEditor'
import { AttachmentUploader } from '../components/AttachmentUploader'
import { EmailPreviewPane } from '../components/EmailPreviewPane'
import { TemplatesModal } from '../components/TemplatesModal'
import { PLACEHOLDERS } from '../lib/placeholders'
import { useRecipients } from '../context/RecipientsContext'
import { useDraft } from '../context/DraftContext'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function ComposePage() {
  const { recipients, selectedIds } = useRecipients()
  const { draft, setDraft } = useDraft()
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [mySettings, setMySettings] = useState({ my_name: '', aiConfigured: false })
  const [previewIndex, setPreviewIndex] = useState(0)
  const [aiPreview, setAiPreview] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const editorRef = useRef(null)
  const navigate = useNavigate()
  const toast = useToast()

  const selected = useMemo(() => recipients.filter((r) => selectedIds.has(r.id)), [recipients, selectedIds])
  const previewRecipient = selected[previewIndex] || selected[0]

  useEffect(() => {
    api.get('/settings').then((res) => setMySettings({ my_name: res.settings.my_name, aiConfigured: res.aiConfigured }))
  }, [])

  const insertPlaceholder = (key) => editorRef.current?.insertPlaceholder(key)

  const loadTemplate = (t) => {
    setDraft({ subject: t.subject, bodyHtml: t.body_html })
    editorRef.current?.setContent(t.body_html)
  }

  const runAiPreview = async () => {
    if (!previewRecipient) return toast.error('Select recipients first to preview AI personalization.')
    setAiLoading(true)
    try {
      const { text } = await api.post('/ai/personalize', previewRecipient)
      setAiPreview(text)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const bodyHasAiPlaceholder = /{{\s*ai_personalization\s*}}/.test(draft.bodyHtml)

  const goToSend = () => {
    if (selected.length === 0) return toast.error('Go back and select at least one recipient.')
    if (!draft.subject.trim()) return toast.error('Add a subject line.')
    if (!draft.bodyHtml || draft.bodyHtml === '<p></p>') return toast.error('Write an email body.')
    navigate('/send')
  }

  return (
    <div>
      <Topbar title="Compose" subtitle={`${selected.length} recipient${selected.length === 1 ? '' : 's'} selected`} />
      <div className="p-4 md:p-8 grid lg:grid-cols-2 gap-6 animate-fade-in">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Email"
              description="Use placeholders below — each recipient gets their own personalized copy."
              actions={
                <Button size="sm" variant="secondary" onClick={() => setTemplatesOpen(true)}>
                  <FileText size={14} /> Templates
                </Button>
              }
            />
            <div className="p-5 space-y-4">
              <div>
                <Label>Subject</Label>
                <Input
                  value={draft.subject}
                  onChange={(e) => setDraft({ subject: e.target.value })}
                  placeholder="Application for {{job_title}} at {{company_name}}"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="!mb-0">Body</Label>
                  <div className="flex flex-wrap gap-1">
                    {PLACEHOLDERS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => insertPlaceholder(p.key)}
                        className="text-xs rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600"
                      >
                        {`{{${p.key}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                <RichTextEditor ref={editorRef} initialContent={draft.bodyHtml} onChange={(html) => setDraft({ bodyHtml: html })} />
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Sparkles size={15} className="text-brand-500" /> AI Personalization
                    </p>
                    <p className="text-xs text-slate-500">Generates a unique opening line per recipient at send time.</p>
                  </div>
                  <Switch checked={draft.aiEnabled} onChange={(v) => setDraft({ aiEnabled: v })} />
                </div>
                {draft.aiEnabled && (
                  <div className="space-y-2 text-xs text-slate-500">
                    {!mySettings.aiConfigured && (
                      <p className="flex items-center gap-1.5 text-amber-600">
                        <Info size={13} /> Server has no GROQ_API_KEY configured — set it in server/.env to enable this.
                      </p>
                    )}
                    <p>
                      Insert{' '}
                      <button type="button" onClick={() => insertPlaceholder('ai_personalization')} className="underline font-medium">
                        {'{{ai_personalization}}'}
                      </button>{' '}
                      where the generated line should appear.
                    </p>
                    {bodyHasAiPlaceholder && (
                      <Button size="sm" variant="secondary" type="button" loading={aiLoading} onClick={runAiPreview}>
                        Preview sample line
                      </Button>
                    )}
                    {aiPreview && <p className="italic text-slate-600 dark:text-slate-400">"{aiPreview}"</p>}
                  </div>
                )}
              </div>

              <div>
                <Label>Attachments (CV, Cover Letter, Portfolio)</Label>
                <AttachmentUploader selectedIds={draft.attachmentIds} onChangeSelected={(ids) => setDraft({ attachmentIds: ids })} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader
              title="Live Preview"
              description="Exactly what this recipient will receive."
              actions={
                selected.length > 1 && (
                  <Select className="w-48" value={previewIndex} onChange={(e) => setPreviewIndex(Number(e.target.value))}>
                    {selected.map((r, i) => (
                      <option key={r.id} value={i}>
                        {r.email}
                      </option>
                    ))}
                  </Select>
                )
              }
            />
            <div className="p-5">
              <EmailPreviewPane
                subject={draft.subject}
                bodyHtml={draft.bodyHtml}
                recipient={previewRecipient}
                myName={mySettings.my_name}
                attachments={[]}
              />
              {previewRecipient && draft.aiEnabled && aiPreview && (
                <p className="text-xs text-slate-400 mt-2">
                  Preview shown above does not include the AI line — see "Preview sample line" for the generated text.
                </p>
              )}
              {!previewRecipient && <p className="text-xs text-amber-600 mt-3">Select recipients on the Recipients page to preview real data.</p>}
            </div>
          </Card>

          <Button size="lg" className="w-full" onClick={goToSend}>
            Continue to Sending <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      <TemplatesModal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onLoad={loadTemplate}
        currentSubject={draft.subject}
        currentBody={draft.bodyHtml}
      />
    </div>
  )
}
