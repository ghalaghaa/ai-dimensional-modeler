import { renderTemplate } from '../lib/placeholders'

export function EmailPreviewPane({ subject, bodyHtml, recipient, myName, senderEmail, attachments = [] }) {
  const data = {
    company_name: recipient?.company_name,
    recruiter_name: recipient?.recruiter_name,
    job_title: recipient?.job_title,
    my_name: myName,
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 space-y-1 text-sm">
        <div className="flex gap-2">
          <span className="text-slate-400 w-14 shrink-0">From</span>
          <span className="text-slate-700 dark:text-slate-300 truncate">{senderEmail || '(select a sender account)'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-400 w-14 shrink-0">To</span>
          <span className="text-slate-700 dark:text-slate-300 truncate">{recipient?.email || '(no recipient selected)'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-400 w-14 shrink-0">Subject</span>
          <span className="font-medium text-slate-900 dark:text-slate-100 truncate">{renderTemplate(subject, data) || '(no subject)'}</span>
        </div>
      </div>
      <div
        className="px-4 py-4 prose prose-sm dark:prose-invert max-w-none min-h-[160px]"
        dangerouslySetInnerHTML={{ __html: renderTemplate(bodyHtml, data) || '<p class="text-slate-400">Your email body will appear here…</p>' }}
      />
      {attachments.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <span key={a.id} className="text-xs rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-slate-600 dark:text-slate-300">
              📎 {a.original_name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
