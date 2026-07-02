import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from './ui/ConfirmDialog'

export function RecipientTable({ recipients, selectedIds, onToggle, onToggleAll, allSelected, onEdit, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <th className="w-10 px-4 py-3">
              <input type="checkbox" checked={allSelected} onChange={onToggleAll} className="rounded accent-brand-600" />
            </th>
            <th className="px-3 py-3">Email</th>
            <th className="px-3 py-3">Company</th>
            <th className="px-3 py-3">Recruiter</th>
            <th className="px-3 py-3">Job Title</th>
            <th className="w-20 px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((r) => (
            <tr
              key={r.id}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={selectedIds.has(r.id)}
                  onChange={() => onToggle(r.id)}
                  className="rounded accent-brand-600"
                />
              </td>
              <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-slate-100">{r.email}</td>
              <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{r.company_name || '—'}</td>
              <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{r.recruiter_name || '—'}</td>
              <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{r.job_title || '—'}</td>
              <td className="px-3 py-2.5">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(r)} className="p-1.5 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setPendingDelete(r)} className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => onDelete(pendingDelete.id)}
        title="Delete recipient?"
        description={`This will remove ${pendingDelete?.email} from your recipient list.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
