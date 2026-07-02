import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2, Building2 } from 'lucide-react'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { avatarGradient, initialsFor } from '../lib/avatar'

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
            <th className="px-3 py-3">Recipient</th>
            <th className="px-3 py-3">Company</th>
            <th className="px-3 py-3">Recruiter</th>
            <th className="px-3 py-3">Job Title</th>
            <th className="w-20 px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((r, i) => {
            const isSelected = selectedIds.has(r.id)
            const seed = r.company_name || r.email
            return (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: Math.min(i, 8) * 0.02 }}
                className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${
                  isSelected ? 'bg-brand-50/60 dark:bg-brand-500/[0.06]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <td className="px-4 py-2.5">
                  <input type="checkbox" checked={isSelected} onChange={() => onToggle(r.id)} className="rounded accent-brand-600" />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br ${avatarGradient(seed)}`}
                    >
                      {initialsFor(r.company_name || r.recruiter_name || r.email)}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate">{r.email}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                  {r.company_name ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={13} className="text-slate-400" /> {r.company_name}
                    </span>
                  ) : (
                    <span className="text-slate-300 dark:text-slate-700">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{r.recruiter_name || <span className="text-slate-300 dark:text-slate-700">—</span>}</td>
                <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{r.job_title || <span className="text-slate-300 dark:text-slate-700">—</span>}</td>
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
              </motion.tr>
            )
          })}
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
