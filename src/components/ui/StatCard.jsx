import { motion } from 'framer-motion'

const TONES = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
}

export function StatCard({ label, value, icon: Icon, tone = 'slate' }) {
  return (
    <motion.div
      layout
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center gap-3"
    >
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${TONES[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{label}</div>
        <motion.div key={value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-xl font-semibold tabular-nums">
          {value}
        </motion.div>
      </div>
    </motion.div>
  )
}
