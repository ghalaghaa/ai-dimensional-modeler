import { motion } from 'framer-motion'

export function ProgressBar({ value = 0, tone = 'brand' }) {
  const colors = { brand: 'bg-brand-600', emerald: 'bg-emerald-500' }
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${colors[tone]}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}
