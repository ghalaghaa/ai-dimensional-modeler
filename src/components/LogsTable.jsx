import { CheckCircle2, XCircle, Info } from 'lucide-react'

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }
const COLORS = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-slate-400',
}

export function LogsTable({ logs }) {
  if (!logs.length) {
    return <div className="p-8 text-center text-sm text-slate-400">No activity yet.</div>
  }
  return (
    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
      {logs.map((log) => {
        const Icon = ICONS[log.level] || Info
        return (
          <div key={log.id} className="flex items-start gap-3 px-5 py-2.5 text-sm">
            <Icon size={16} className={`mt-0.5 shrink-0 ${COLORS[log.level]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-slate-700 dark:text-slate-300 break-words">{log.message}</p>
            </div>
            <span className="text-xs text-slate-400 shrink-0 tabular-nums">
              {new Date(log.created_at.replace(' ', 'T') + 'Z').toLocaleTimeString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
