import { motion } from 'framer-motion'

export function ProgressBar({ value = 0, animated = false }) {
  return (
    <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
      <motion.div
        className="h-full rounded-full bg-brand-gradient bg-200 relative overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundPosition: animated ? ['0% 50%', '100% 50%'] : '0% 50%' }}
        transition={{ width: { duration: 0.4, ease: 'easeOut' }, backgroundPosition: { duration: 3, repeat: animated ? Infinity : 0, ease: 'linear' } }}
      >
        {animated && (
          <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        )}
      </motion.div>
    </div>
  )
}
